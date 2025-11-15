"use server";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE USER
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create({
      clerkId: user.clerkId,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo,
    });

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
    throw error; // IMPORTANT
  }
}

// READ USER
export async function getUserById(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// UPDATE USER
export async function updateUser(clerkId: string, updates: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        ...(updates.firstName !== null && { firstName: updates.firstName }),
        ...(updates.lastName !== null && { lastName: updates.lastName }),
        ...(updates.username !== null && { username: updates.username }),
        ...(updates.photo !== null && { photo: updates.photo }),
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// DELETE USER
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) throw new Error("User not found");

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// UPDATE USER CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );

    if (!updatedUser) throw new Error("Failed to update credits");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
    throw error;
  }
}
