/* eslint-disable camelcase */
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing WEBHOOK_SECRET in environment variables.");
  }

  // Read Svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification error:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  // ============================================================
  // USER CREATED
  // ============================================================
  if (eventType === "user.created") {
    const { email_addresses, image_url, first_name, last_name, username } = evt.data;

    const email = email_addresses?.[0]?.email_address || "";

    // Ensure username is never null
    const safeUsername =
      (username ||
        email.split("@")[0] ||
        `user_${id}`).toLowerCase();

    const userData: CreateUserParams = {
      clerkId: id,
      email,
      username: safeUsername,
      firstName: first_name || "",
      lastName: last_name || "",
      photo: image_url || "",
    };

    const newUser = await createUser(userData);

    // Save DB userId in Clerk metadata
    if (newUser) {
      await clerkClient.users.updateUser(id, {
        publicMetadata: { userId: String(newUser._id) },
      });
    }

    return NextResponse.json({ message: "OK", user: newUser });
  }

  // ============================================================
  // USER UPDATED
  // ============================================================
  if (eventType === "user.updated") {
    const { image_url, first_name, last_name, username } = evt.data;

    const updatedData: UpdateUserParams = {
      firstName: first_name ?? null,
      lastName: last_name ?? null,
      username: username ? username.toLowerCase() : null,
      photo: image_url ?? null,
    };

    const updatedUser = await updateUser(id, updatedData);

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  // ============================================================
  // USER DELETED
  // ============================================================
  if (eventType === "user.deleted") {
    const deletedUser = await deleteUser(id);
    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  return new Response("Unhandled event type", { status: 200 });
}
