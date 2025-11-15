/* eslint-disable camelcase */
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;



  if (!WEBHOOK_SECRET) {
    console.error("❌ Missing CLERK_WEBHOOK_SECRET");
    return new Response("Missing secret", { status: 500 });
  }

  const h = await headers();
  const svix_id = h.get("svix-id");
  const svix_timestamp = h.get("svix-timestamp");
  const svix_signature = h.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers");
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  let evt: WebhookEvent;

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;

  // Respond immediately to avoid Clerk retry/timeout issues
  queueMicrotask(async () => {
    try {
      const data = evt.data;

      if (eventType === "user.created") {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          username,
          image_url,
        } = data as any;

        console.log(
          `📝 Creating user with clerkId: ${id}, email: ${email_addresses?.[0]?.email_address}`
        );

        const result = await createUser({
          clerkId: id,
          email: email_addresses?.[0]?.email_address ?? "",
          username:
            (username && typeof username === "string"
              ? username.trim().toLowerCase()
              : "") ||
            (email_addresses?.[0]?.email_address
              ? email_addresses[0].email_address.split("@")[0]
              : `user_${id}`),
          firstName: first_name ?? "",
          lastName: last_name ?? "",
          photo: image_url ?? "",
        });

        console.log(`✅ User created successfully:`, result);
      }

      if (eventType === "user.updated") {
        const { id, first_name, last_name, username, image_url } = data as any;

        console.log(`📝 Updating user with clerkId: ${id}`);

        const result = await updateUser(id, {
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          username: username ? username.trim().toLowerCase() : null,
          photo: image_url ?? null,
        });

        console.log(`✅ User updated successfully:`, result);
      }

      if (eventType === "user.deleted") {
        const { id } = data as any;

        console.log(`📝 Deleting user with clerkId: ${id}`);

        const result = await deleteUser(id);

        console.log(`✅ User deleted successfully:`, result);
      }
    } catch (err) {
      console.error("❌ Background handler error:", err);
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
    }
  });

  return new Response("OK", { status: 200 });
}