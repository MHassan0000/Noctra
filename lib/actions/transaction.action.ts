"use server";

import { redirect } from 'next/navigation'
import Stripe from "stripe";
import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits, getUserById } from './user.actions';

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const amount = Number(transaction.amount) * 100;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: transaction.plan,
          }
        },
        quantity: 1
      }
    ],
    metadata: {
      plan: transaction.plan,
      credits: transaction.credits,
      buyerId: transaction.buyerId,
    },
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
  })

  redirect(session.url!)
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    // Find user by Clerk ID to get MongoDB _id
    const user = await getUserById(transaction.buyerId);

    if (!user || !user._id) {
      throw new Error(`User not found for buyerId: ${transaction.buyerId}`);
    }

    // Check if transaction already exists (idempotency)
    const existingTransaction = await Transaction.findOne({
      stripeId: transaction.stripeId,
    });

    if (existingTransaction) {
      console.log(`Transaction ${transaction.stripeId} already exists`);
      return JSON.parse(JSON.stringify(existingTransaction));
    }

    // Create a new transaction with MongoDB user _id
    const newTransaction = await Transaction.create({
      stripeId: transaction.stripeId,
      amount: transaction.amount,
      plan: transaction.plan,
      credits: transaction.credits,
      buyer: user._id,
      createdAt: transaction.createdAt,
    });

    // Update user credits using MongoDB _id
    await updateCredits(user._id, transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    console.error("Error in createTransaction:", error);
    handleError(error);
  }
}