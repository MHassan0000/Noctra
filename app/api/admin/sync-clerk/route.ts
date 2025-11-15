"use server";

import { NextResponse } from "next/server";
import { syncClerkWithDatabase, deleteUserFromClerkOnly } from "@/lib/actions/user.actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Sync Clerk with database (delete orphaned users from Clerk)
export async function GET() {
  try {
    const result = await syncClerkWithDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// POST: Delete specific user from Clerk only
// Body: { clerkId: "user_xxx" }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clerkId } = body;

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "clerkId is required" },
        { status: 400 }
      );
    }

    const result = await deleteUserFromClerkOnly(clerkId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Delete from Clerk error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

