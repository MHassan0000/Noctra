/* eslint-disable camelcase */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; // ✅ FIXED
  if (!WEBHOOK_SECRET) {
    console.error("❌ Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Missing secret" }, { status: 500 });
  }

  // ❌ do NOT "await" headers()
  const h = (await Promise.resolve(headers())) as Headers;
  const svix_id = h.get("svix-id") ?? "";
  const svix_timestamp = h.get("svix-timestamp");
  const svix_signature = h.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers");
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Read raw body FOR svix verification
  const rawBody = await req.text();

  let evt: WebhookEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(rawBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Signature verification error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;

  try {
    // USER CREATED
    if (eventType === "user.created") {
      const { id, email_addresses, image_url, first_name, last_name, username } =
        evt.data as any;

      const email =
        Array.isArray(email_addresses) &&
        email_addresses[0]?.email_address
          ? email_addresses[0].email_address
          : "";

      const safeUsername =
        username?.trim().toLowerCase() ||
        (email ? email.split("@")[0] : `user_${id}`);

      const newUser = await createUser({
        clerkId: String(id),
        email,
        username: safeUsername,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        photo: image_url ?? "",
      });

      return NextResponse.json({ message: "OK", user: newUser });
    }

    // USER UPDATED
    if (eventType === "user.updated") {
      const { id, image_url, first_name, last_name, username } = evt.data as any;

      const updatePayload = {
        firstName: first_name ?? null,
        lastName: last_name ?? null,
        username: username?.trim().toLowerCase() || null,
        photo: image_url ?? null,
      };

      const updatedUser = await updateUser(String(id), updatePayload);
      return NextResponse.json({ message: "OK", user: updatedUser });
    }

    // USER DELETED
    if (eventType === "user.deleted") {
      const { id } = evt.data as any;
      const deletedUser = await deleteUser(String(id));
      return NextResponse.json({ message: "OK", user: deletedUser });
    }

    return new Response("", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
