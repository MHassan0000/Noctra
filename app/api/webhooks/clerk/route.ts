import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; 
  

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is missing");
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers", { svix_id, svix_timestamp, svix_signature });
    return NextResponse.json(
      { error: "Error occurred -- no svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

 
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error occurred during webhook verification" },
      { status: 400 }
    );
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  // CREATE
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    try {
      // Validate required fields
      if (!email_addresses || email_addresses.length === 0 || !email_addresses[0]?.email_address) {
        console.error("Email is required but missing in webhook data");
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username || `user_${id.slice(0, 8)}`,
        firstName: first_name || "",
        lastName: last_name || "",
        photo: image_url || "",
      };

      const newUser = await createUser(user);

      // Set public metadata
      if (newUser) {
        await (await clerkClient()).users.updateUserMetadata(id, {
          publicMetadata: {
            userId: newUser._id,
          },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Error creating user", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    try {
      if (!id) {
        return NextResponse.json(
          { error: "User ID is missing" },
          { status: 400 }
        );
      }

      const user = {
        firstName: first_name || null,
        lastName: last_name || null,
        username: username || null,
        photo: image_url || null,
      };

      const updatedUser = await updateUser(id, user);

      if (!updatedUser) {
        return NextResponse.json(
          { error: "User not found for update" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "OK", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Error updating user", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  }

  // DELETE
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      if (!id) {
        return NextResponse.json(
          { error: "User ID is missing" },
          { status: 400 }
        );
      }

      // Skip Clerk deletion since Clerk already deleted the user (that's why we got this webhook)
      const deletedUser = await deleteUser(id, true);

      // If user was already deleted or doesn't exist, return success anyway
      // This handles cases where the webhook is called multiple times
      if (!deletedUser) {
        console.log(`User with Clerk ID ${id} was already deleted or not found in database`);
        return NextResponse.json({ 
          message: "OK", 
          note: "User was already deleted or not found in database" 
        });
      }

      return NextResponse.json({ message: "OK", user: deletedUser });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Error deleting user", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  }

  console.log(`Webhook with ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}