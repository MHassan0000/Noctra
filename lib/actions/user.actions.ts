"use server";

import User from "@/lib/database/models/user.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";

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
    console.error("❌ createUser error:", error);
    handleError(error);
    throw error;
  }
}

// READ USER
export async function getUserById(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("❌ getUserById error:", error);
    handleError(error);
    throw error;
  }
}

// UPDATE USER
export async function updateUser(clerkId: string, updates: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updateObj: any = {};
    if (updates.firstName !== null) updateObj.firstName = updates.firstName;
    if (updates.lastName !== null) updateObj.lastName = updates.lastName;
    if (updates.username !== null) updateObj.username = updates.username;
    if (updates.photo !== null) updateObj.photo = updates.photo;

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      updateObj,
      { new: true }
    );

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error("❌ updateUser error:", error);
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
    console.error("❌ deleteUser error:", error);
    handleError(error);
    throw error;
  }
}
