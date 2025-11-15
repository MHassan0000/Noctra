/* eslint-disable camelcase */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server"; // typing only, OK to keep

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";



export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET env var");
    return NextResponse.json({ error: "Missing WEBHOOK_SECRET" }, { status: 500 });
  }

  // await headers() — works whether headers() returns a Promise or a plain ReadonlyHeaders
  const h = await headers();
  const svix_id = h.get("svix-id") ?? "";
  const svix_timestamp = h.get("svix-timestamp") ?? "";
  const svix_signature = h.get("svix-signature") ?? "";

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers", { svix_id, svix_timestamp, svix_signature });
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // read raw body for svix verification
  const rawBody = await req.text();

  // verify via svix
  let evt: WebhookEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(rawBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // make event data safe
  const eventType = evt?.type ?? "";
  // evt.data shape depends on event type — we handle user.created/user.updated/user.deleted
  try {
    // ---------- USER CREATED ----------
    if (eventType === "user.created") {
      // extract fields safely from evt.data
      const {
        id,
        email_addresses,
        image_url,
        first_name,
        last_name,
        username,
      } = evt.data as any;

      const email: string =
        (Array.isArray(email_addresses) && email_addresses[0]?.email_address) || "";

      // safe username: prefer provided username, then email prefix, then fallback to clerk id
      const safeUsername: string =
        (typeof username === "string" && username.trim().length > 0
          ? username.trim().toLowerCase()
          : email
          ? email.split("@")[0].toLowerCase()
          : `user_${String(id)}`);

      const userPayload: CreateUserParams = {
        clerkId: String(id),
        email: String(email),
        username: safeUsername,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        photo: image_url ?? "",
      };

      const newUser = await createUser(userPayload);

      // NOTE: we do NOT attempt to update Clerk metadata here to avoid clerkClient mismatch issues.
      // If you want to set Clerk publicMetadata later, ensure clerkClient import matches your installed Clerk package.

      return NextResponse.json({ message: "OK", user: newUser });
    }

    // ---------- USER UPDATED ----------
    if (eventType === "user.updated") {
      const { id, image_url, first_name, last_name, username, email_addresses } =
        evt.data as any;

      // If username is null/undefined, make it null (matches your UpdateUserParams)
      const maybeUsername: string | null =
        typeof username === "string" && username.trim().length > 0
          ? username.trim().toLowerCase()
          : null;

      const updatePayload: UpdateUserParams = {
        firstName: first_name ?? null,
        lastName: last_name ?? null,
        username: maybeUsername,
        photo: image_url ?? null,
      };

      const updatedUser = await updateUser(String(id), updatePayload);

      return NextResponse.json({ message: "OK", user: updatedUser });
    }

    // ---------- USER DELETED ----------
    if (eventType === "user.deleted") {
      const { id } = evt.data as any;
      const deletedUser = await deleteUser(String(id));
      return NextResponse.json({ message: "OK", user: deletedUser });
    }

    // Unknown event: respond 200 so Clerk stops retrying (or change to 204)
    return new Response("", { status: 200 });
  } catch (err) {
    // log and return 500 so Clerk shows the failure in dashboard
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
