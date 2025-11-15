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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { clerkId: user.clerkId },
        { email: user.email },
        { username: user.username }
      ]
    });

    if (existingUser) {
      // If user exists with same clerkId, return existing user
      if (existingUser.clerkId === user.clerkId) {
        return JSON.parse(JSON.stringify(existingUser));
      }
      throw new Error("User with this email or username already exists");
    }

    const newUser = await User.create(user);

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
export async function deleteUser(clerkId: string) {
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

    // Delete related data (images and transactions)
    await Promise.all([
      Image.deleteMany({ author: userId }),
      Transaction.deleteMany({ buyer: userId })
    ]);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error("Failed to delete user");
    }

    revalidatePath("/");
    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE USER FROM BOTH CLERK AND DATABASE
export async function deleteUserFromClerkAndDB(clerkId: string) {
  try {
    // First delete from database
    const deletedUser = await deleteUser(clerkId);
    
    if (!deletedUser) {
      throw new Error("User not found in database");
    }

    // Then delete from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    
    try {
      await client.users.deleteUser(clerkId);
    } catch (clerkError) {
      // If Clerk deletion fails, log but don't fail the whole operation
      // The user is already deleted from database
      console.error("Failed to delete user from Clerk:", clerkError);
      // Optionally, you could re-create the user in DB if needed
    }

    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    handleError(error);
  }
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