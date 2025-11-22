/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Stripe webhook endpoint is active' });
}

export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!endpointSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { message: "Webhook error", error: err.message },
      { status: 400 }
    );
  }

  // Get the ID and type
  const eventType = event.type;

  // CREATE
  if (eventType === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { id, amount_total, metadata } = session;

    if (!metadata?.buyerId) {
      console.error("Missing buyerId in metadata");
      return NextResponse.json(
        { error: "Missing buyerId in metadata" },
        { status: 400 }
      );
    }

    const transaction = {
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || "",
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata.buyerId,
      createdAt: new Date(),
    };

    try {
      const newTransaction = await createTransaction(transaction);
      
      if (!newTransaction) {
        console.error("Failed to create transaction");
        return NextResponse.json(
          { error: "Failed to create transaction" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "OK", transaction: newTransaction },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      return NextResponse.json(
        { error: "Failed to process transaction", message: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}