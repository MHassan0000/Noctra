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
      let clerkDeletionSuccess = false;
      let clerkErrorThrown: Error | null = null;
      
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        
        console.log(`[DELETE USER] Attempting to delete user ${clerkId} from Clerk...`);
        
        // Verify user exists in Clerk first
        try {
          const clerkUser = await client.users.getUser(clerkId);
          console.log(`[DELETE USER] User ${clerkId} found in Clerk, proceeding with deletion...`);
        } catch (getError: any) {
          const getErrorStatus = getError?.status || getError?.statusCode;
          if (getErrorStatus === 404) {
            console.log(`[DELETE USER] User ${clerkId} not found in Clerk (already deleted), proceeding with database deletion only`);
            clerkDeletionSuccess = true;
          } else {
            throw getError; // Re-throw if it's not a 404
          }
        }
        
        // Delete from Clerk - this must succeed (unless user doesn't exist)
        if (!clerkDeletionSuccess) {
          await client.users.deleteUser(clerkId);
          clerkDeletionSuccess = true;
          console.log(`[DELETE USER] ✓ Successfully deleted user ${clerkId} from Clerk`);
        }
      } catch (clerkError: any) {
        clerkErrorThrown = clerkError;
        
        // Log the full error for debugging
        console.error("[DELETE USER] Clerk deletion error details:", {
          error: clerkError,
          message: clerkError?.message,
          status: clerkError?.status,
          statusCode: clerkError?.statusCode,
          code: clerkError?.code,
          errors: clerkError?.errors,
          clerkError: clerkError?.clerkError,
          stack: clerkError?.stack
        });

        // Check if error is because user doesn't exist (404)
        // Clerk SDK might return errors in different formats
        const errorMessage = String(clerkError?.message || '').toLowerCase();
        const errorStatus = clerkError?.status || clerkError?.statusCode || clerkError?.clerkError?.status;
        const errorCode = String(clerkError?.code || '').toLowerCase();
        
        const isNotFound = 
          errorStatus === 404 ||
          errorCode === 'not_found' ||
          errorCode === 'resource_not_found' ||
          errorMessage.includes('not found') ||
          errorMessage.includes('404') ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('could not be found');

        if (isNotFound) {
          // User doesn't exist in Clerk - that's okay, continue with DB deletion
          console.log(`[DELETE USER] ⚠ User ${clerkId} not found in Clerk (may have been already deleted), proceeding with database deletion`);
          clerkDeletionSuccess = true; // Treat as success for our purposes
          clerkErrorThrown = null; // Clear the error since it's acceptable
        } else {
          // For any other error, we need to prevent database deletion
          const errorDetails = {
            message: clerkError?.message || 'Unknown error',
            status: errorStatus,
            code: clerkError?.code
          };
          
          console.error(`[DELETE USER] ✗ CRITICAL: Failed to delete user ${clerkId} from Clerk:`, errorDetails);
          // Don't set clerkDeletionSuccess = true, so we can check it below
        }
      }

      // CRITICAL: If Clerk deletion failed (and it wasn't a 404), throw error to prevent DB deletion
      if (!clerkDeletionSuccess && clerkErrorThrown) {
        const errorMessage = clerkErrorThrown?.message || 'Unknown error';
        const errorStatus = (clerkErrorThrown as any)?.status || (clerkErrorThrown as any)?.statusCode || 'N/A';
        const errorCode = (clerkErrorThrown as any)?.code || 'N/A';
        
        const finalError = new Error(
          `[DELETE USER] CRITICAL ERROR: Failed to delete user from Clerk. ` +
          `Error: ${errorMessage} (Status: ${errorStatus}, Code: ${errorCode}). ` +
          `User will NOT be deleted from database to maintain consistency. ` +
          `Please check your Clerk API key and permissions. ` +
          `User ${clerkId} still exists in Clerk.`
        );
        
        console.error(finalError.message);
        throw finalError;
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

// DELETE USER FROM CLERK ONLY (useful when you've already deleted from database)
// Use this if you deleted a user from MongoDB Compass and need to clean up Clerk
export async function deleteUserFromClerkOnly(clerkId: string) {
  try {
    if (!clerkId || clerkId.trim() === "") {
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
      const errorStatus = clerkError?.status || clerkError?.statusCode;
      const errorMessage = String(clerkError?.message || '').toLowerCase();
      
      if (errorStatus === 404 || errorMessage.includes('not found') || errorMessage.includes('404')) {
        console.log(`[CLEANUP] User ${clerkId} not found in Clerk (already deleted)`);
        return { success: true, message: `User ${clerkId} not found in Clerk (already deleted)` };
      }
      
      throw new Error(`Failed to delete user from Clerk: ${clerkError?.message || 'Unknown error'}`);
    }
  } catch (error) {
    handleError(error);
  }
}

// SYNC: Delete users from Clerk that don't exist in database
// Use this to clean up orphaned users in Clerk after manual database deletions
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
      
      if (clerkUsersResponse.data.length < limit) {
        break; // No more users
      }
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
        const errorStatus = error?.status || error?.statusCode;
        if (errorStatus === 404) {
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