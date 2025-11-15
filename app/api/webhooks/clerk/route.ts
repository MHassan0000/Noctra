/* eslint-disable camelcase */
import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error(
            "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
        );
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        });
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
        console.error("Error verifying webhook:", err);
        return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    // ========== USER CREATED ========== //
    if (eventType === "user.created") {
        const {
            id,
            email_addresses,
            image_url,
            first_name,
            last_name,
            username,
        } = evt.data;

        const email = email_addresses?.[0]?.email_address || "";

        // FIX: Prevent undefined username
        const safeUsername =
            (username || "")
                .trim()
                .toLowerCase() ||
            (email ? email.split("@")[0] : "") ||
            `user_${id}`;

        const user = {
            clerkId: id,
            email: email || "",
            username: safeUsername || "",
            firstName: first_name || "",
            lastName: last_name || "",
            photo: image_url || "",
        };

        const newUser = await createUser(user);

        // Store DB user ID in Clerk metadata
        if (newUser) {
            const client = await clerkClient();
            await client.users.updateUserMetadata(id, {
                publicMetadata: {
                    userId: String(newUser._id),
                },
            });
        }

        return NextResponse.json({ message: "OK", user: newUser });
    }

    // ========== USER UPDATED ========== //
    if (eventType === "user.updated") {
        const { id, image_url, first_name, last_name, username } = evt.data;

        const updateData = {
            firstName: first_name || "",
            lastName: last_name || "",
            username: (username || "").trim().toLowerCase() || "",
            photo: image_url || "",
        };

        const updatedUser = await updateUser(id, updateData);

        return NextResponse.json({ message: "OK", user: updatedUser });
    }

    // ========== USER DELETED ========== //
    if (eventType === "user.deleted") {
        const { id } = evt.data;

        if (!id) {
            return new Response("Missing user id in webhook", { status: 400 });
        }

        const deletedUser = await deleteUser(id);

        return NextResponse.json({ message: "OK", user: deletedUser });
    }

    return new Response("Unhandled webhook event", { status: 200 });
}
