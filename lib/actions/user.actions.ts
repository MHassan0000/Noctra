"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import Transaction from "../database/models/transaction.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";


function isClerkNotFoundError(error: any): boolean {
  const errorStatus = error?.status || error?.statusCode || error?.clerkError?.status;
  const errorMessage = String(error?.message || '').toLowerCase();
  const errorCode = String(error?.code || '').toLowerCase();
  
  return (
    errorStatus === 404 ||
    errorCode === 'not_found' ||
    errorCode === 'resource_not_found' ||
    errorMessage.includes('not found') ||
    errorMessage.includes('404') ||
    errorMessage.includes('does not exist') ||
    errorMessage.includes('could not be found')
  );
}

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    // Check if user already exists by clerkId (most important check)
    const existingUser = await User.findOne({ clerkId: user.clerkId });
    
    if (existingUser) {
      console.log(`User with Clerk ID ${user.clerkId} already exists in database`);
      return JSON.parse(JSON.stringify(existingUser));
    }

    // Check for conflicts with email or username in one query
    const conflictUser = await User.findOne({
      $or: [
        { email: user.email, clerkId: { $ne: user.clerkId } },
        { username: user.username, clerkId: { $ne: user.clerkId } }
      ]
    });
    
    if (conflictUser) {
      const conflictField = conflictUser.email === user.email ? 'email' : 'username';
      throw new Error(`User with this ${conflictField} already exists`);
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
    if (!userId?.trim()) {
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
    if (!clerkId?.trim()) {
      throw new Error("Clerk ID is required");
    }
    const existingUser = await User.findOne({ clerkId });
    if (!existingUser) {
      throw new Error("User not found");
    }
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
      { ...user, updatedAt: new Date() },
      { new: true, runValidators: true }
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
    if (!clerkId?.trim()) {
      throw new Error("Clerk ID is required");
    }

    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) {
      return null; // User doesn't exist - allow graceful handling
    }

    const userId = userToDelete._id;

    // Delete from Clerk first (if not skipped)
    if (!skipClerkDeletion) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        
        console.log(`[DELETE USER] Attempting to delete user ${clerkId} from Clerk...`);
        await client.users.deleteUser(clerkId);
        console.log(`[DELETE USER] ✓ Successfully deleted user ${clerkId} from Clerk`);
      } catch (clerkError: any) {
        if (isClerkNotFoundError(clerkError)) {
          console.log(`[DELETE USER] User ${clerkId} not found in Clerk (already deleted), proceeding with database deletion`);
        } else {
          // Log full error for debugging
          console.error("[DELETE USER] Clerk deletion error:", {
            message: clerkError?.message,
            status: clerkError?.status || clerkError?.statusCode,
            code: clerkError?.code
          });
          throw new Error(
            `Failed to delete user from Clerk: ${clerkError?.message || 'Unknown error'}. ` +
            `User will NOT be deleted from database to maintain consistency.`
          );
        }
      }
    }

    // Delete related data
    await Promise.all([
      Image.deleteMany({ author: userId }),
      Transaction.deleteMany({ buyer: userId })
    ]);

    // Delete user from database
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("Failed to delete user from database");
    }

    console.log(`[DELETE USER] Successfully deleted user ${clerkId} from database`);
    revalidatePath("/");
    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE USER FROM BOTH CLERK AND DATABASE

export async function deleteUserFromClerkAndDB(clerkId: string) {
 
  return deleteUser(clerkId, false);
}


export async function deleteUserFromClerkOnly(clerkId: string) {
  try {
    if (!clerkId?.trim()) {
      throw new Error("Clerk ID is required");
    }

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    
    console.log(`[CLEANUP] Attempting to delete user ${clerkId} from Clerk...`);
    
    try {
      await client.users.deleteUser(clerkId);
      console.log(`[CLEANUP] ✓ Successfully deleted user ${clerkId} from Clerk`);
      return { success: true, message: `User ${clerkId} deleted from Clerk` };
    } catch (clerkError: any) {
      if (isClerkNotFoundError(clerkError)) {
        console.log(`[CLEANUP] User ${clerkId} not found in Clerk (already deleted)`);
        return { success: true, message: `User ${clerkId} not found in Clerk (already deleted)` };
      }
      throw new Error(`Failed to delete user from Clerk: ${clerkError?.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error);
  }
}


export async function syncClerkWithDatabase() {
  try {
    await connectToDatabase();
    
    console.log("[SYNC] Starting sync: Finding orphaned users in Clerk...");
    
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    
    // Get all users from database
    const dbUsers = await User.find({}, { clerkId: 1 });
    const dbClerkIds = new Set(dbUsers.map(u => u.clerkId));
    
    console.log(`[SYNC] Found ${dbClerkIds.size} users in database`);
    
    // Get all users from Clerk (paginated)
    let allClerkUsers: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const clerkUsersResponse = await client.users.getUserList({ limit, offset });
      allClerkUsers = allClerkUsers.concat(clerkUsersResponse.data);
      if (clerkUsersResponse.data.length < limit) break;
      offset += limit;
    }
    
    console.log(`[SYNC] Found ${allClerkUsers.length} users in Clerk`);
    
    // Find users in Clerk that don't exist in database
    const orphanedUsers = allClerkUsers.filter(
      clerkUser => !dbClerkIds.has(clerkUser.id)
    );
    
    console.log(`[SYNC] Found ${orphanedUsers.length} orphaned users in Clerk`);
    
    // Delete orphaned users from Clerk
    const results = {
      total: orphanedUsers.length,
      deleted: 0,
      failed: 0,
      notFound: 0,
      errors: [] as string[]
    };
    
    for (const orphanedUser of orphanedUsers) {
      try {
        await client.users.deleteUser(orphanedUser.id);
        results.deleted++;
        console.log(`[SYNC] ✓ Deleted orphaned user ${orphanedUser.id} from Clerk`);
      } catch (error: any) {
        if (isClerkNotFoundError(error)) {
          results.notFound++;
        } else {
          results.failed++;
          const errorMsg = `Failed to delete ${orphanedUser.id}: ${error?.message || 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(`[SYNC] ✗ ${errorMsg}`);
        }
      }
    }
    
    console.log(`[SYNC] Sync complete:`, results);
    
    return {
      success: true,
      ...results,
      message: `Sync complete: ${results.deleted} deleted, ${results.failed} failed, ${results.notFound} not found`
    };
  } catch (error) {
    handleError(error);
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();
    if (!userId?.trim()) {
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
    if (updatedUserCredits.creditBalance < 0) {
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