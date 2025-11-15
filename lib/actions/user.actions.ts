"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import Transaction from "../database/models/transaction.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    // Check if user already exists by clerkId (most important check)
    const existingUserByClerkId = await User.findOne({ clerkId: user.clerkId });
    
    if (existingUserByClerkId) {
      // User with this Clerk ID already exists, return existing user
      console.log(`User with Clerk ID ${user.clerkId} already exists in database`);
      return JSON.parse(JSON.stringify(existingUserByClerkId));
    }

    // Check for conflicts with email or username (but allow if it's the same Clerk user)
    const existingUserByEmail = await User.findOne({ 
      email: user.email,
      clerkId: { $ne: user.clerkId }
    });
    
    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    const existingUserByUsername = await User.findOne({ 
      username: user.username,
      clerkId: { $ne: user.clerkId }
    });
    
    if (existingUserByUsername) {
      throw new Error("User with this username already exists");
    }

    const newUser = await User.create(user);
    console.log(`Successfully created user ${user.clerkId} in database`);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required");
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    if (!clerkId || clerkId.trim() === "") {
      throw new Error("Clerk ID is required");
    }

    // Check if user exists
    const existingUser = await User.findOne({ clerkId });
    if (!existingUser) {
      throw new Error("User not found");
    }

    // If username is being updated, check for conflicts
    if (user.username && user.username !== existingUser.username) {
      const usernameExists = await User.findOne({ 
        username: user.username,
        clerkId: { $ne: clerkId }
      });
      if (usernameExists) {
        throw new Error("Username already taken");
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { 
        ...user,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    revalidatePath("/");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string, skipClerkDeletion: boolean = false) {
  try {
    await connectToDatabase();

    if (!clerkId || clerkId.trim() === "") {
      throw new Error("Clerk ID is required");
    }

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      // User doesn't exist, return null instead of throwing error
      // This allows webhook to handle gracefully if user was already deleted
      return null;
    }

    const userId = userToDelete._id;

    // Delete from Clerk first (if not skipped - e.g., when called from webhook)
    if (!skipClerkDeletion) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        
        // Delete from Clerk - this must succeed (unless user doesn't exist)
        await client.users.deleteUser(clerkId);
        console.log(`Successfully deleted user ${clerkId} from Clerk`);
      } catch (clerkError: any) {
        // Check if error is because user doesn't exist (404)
        const isNotFound = 
          clerkError?.status === 404 || 
          clerkError?.statusCode === 404 ||
          clerkError?.clerkError?.status === 404 ||
          (clerkError?.message && clerkError.message.includes('not found')) ||
          (clerkError?.message && clerkError.message.includes('404'));

        if (isNotFound) {
          // User doesn't exist in Clerk - that's okay, continue with DB deletion
          console.log(`User ${clerkId} not found in Clerk (may have been already deleted), proceeding with database deletion`);
        } else {
          // For any other error, throw to prevent partial deletion
          // This ensures we don't leave user in Clerk but delete from DB
          console.error("Error deleting user from Clerk:", {
            message: clerkError?.message,
            status: clerkError?.status || clerkError?.statusCode,
            clerkError: clerkError?.clerkError
          });
          throw new Error(`Failed to delete user from Clerk: ${clerkError?.message || 'Unknown error'}. User will not be deleted from database to maintain consistency.`);
        }
      }
    }

    // Delete related data (images and transactions)
    await Promise.all([
      Image.deleteMany({ author: userId }),
      Transaction.deleteMany({ buyer: userId })
    ]);

    // Delete user from database
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error("Failed to delete user from database");
    }

    console.log(`Successfully deleted user ${clerkId} from database`);
    revalidatePath("/");
    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE USER FROM BOTH CLERK AND DATABASE
// This is now the default behavior of deleteUser, but kept for backward compatibility
export async function deleteUserFromClerkAndDB(clerkId: string) {
  // deleteUser now deletes from both by default
  return deleteUser(clerkId, false);
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required");
    }

    if (typeof creditFee !== "number" || isNaN(creditFee)) {
      throw new Error("Credit fee must be a valid number");
    }

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee }},
      { new: true, runValidators: true }
    );

    if (!updatedUserCredits) {
      throw new Error("User credits update failed - user not found");
    }

    // Ensure credit balance doesn't go negative
    if (updatedUserCredits.creditBalance < 0) {
      // Revert the update
      await User.findOneAndUpdate(
        { _id: userId },
        { $inc: { creditBalance: -creditFee }}
      );
      throw new Error("Insufficient credits");
    }

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}