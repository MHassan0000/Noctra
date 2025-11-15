import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // Username should NOT be required
  username: {
    type: String,
    unique: true,
    sparse: true,    // prevents unique index errors on empty strings
  },

  // Photo should NOT be required
  photo: {
    type: String,
    default: "",
  },

  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },

  planId: {
    type: Number,
    default: 1,
  },
  creditBalance: {
    type: Number,
    default: 10,
  },
});

const User = models?.User || model("User", UserSchema);

export default User;
