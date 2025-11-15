/* eslint-disable camelcase */
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

        try {
            console.log("Creating user with data:", JSON.stringify(user, null, 2));
            const newUser = await createUser(user);
            console.log("User created successfully:", JSON.stringify(newUser, null, 2));
            return NextResponse.json({ message: "OK", user: newUser }, { status: 201 });
        } catch (error: any) {
            console.error("Error creating user:", error?.message || error);
            console.error("Full error:", error);
            return NextResponse.json(
                { error: "Failed to create user", details: error?.message || String(error) },
                { status: 500 }
            );
        }
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

        try {
            const updatedUser = await updateUser(id, updateData);
            return NextResponse.json({ message: "OK", user: updatedUser });
        } catch (error) {
            console.error("Error updating user:", error);
            return NextResponse.json(
                { error: "Failed to update user" },
                { status: 500 }
            );
        }
    }

    // ========== USER DELETED ========== //
    if (eventType === "user.deleted") {
        const { id } = evt.data;

        if (!id) {
            return new Response("Missing user id in webhook", { status: 400 });
        }

        try {
            const deletedUser = await deleteUser(id);
            return NextResponse.json({ message: "OK", user: deletedUser });
        } catch (error) {
            console.error("Error deleting user:", error);
            return NextResponse.json(
                { error: "Failed to delete user" },
                { status: 500 }
            );
        }
    }

    return new Response("Unhandled webhook event", { status: 200 });
}
