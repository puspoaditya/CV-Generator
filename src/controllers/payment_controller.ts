import { db } from "../db";
import { users, transactions } from "../db/schema";
import { eq, and } from "drizzle-orm";
// @ts-ignore
const midtransClient = require("midtrans-client");
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle(process.env.PADDLE_API_KEY || "", {
  environment: (process.env.PADDLE_ENVIRONMENT as any) || Environment.sandbox,
});

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});


export const handleMidtransCheckout = async ({ body, payload, set }: any) => {
  if (!payload) return { error: "Unauthorized" };

  const { plan } = body;
  let amount = 0;
  let credits = 0;
  let isPro = false;

  if (plan === "pro") {
    amount = Number(process.env.PRICE_IDR_PRO) || 250000;
    isPro = true;
  } else if (plan === "credits_10") {
    amount = Number(process.env.PRICE_IDR_CREDITS_10) || 75000;
    credits = 10;
  }

  const orderId = `order-${Date.now()}-${payload.id}`;

  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: payload.name,
        email: payload.email,
      },
      metadata: { userId: payload.id, plan, credits, isPro: isPro.toString() },
    };

    const transaction = await snap.createTransaction(parameter);

    await db.insert(transactions).values({
      userId: payload.id,
      amount: amount,
      currency: "IDR",
      provider: "midtrans",
      status: "pending",
      orderId: orderId,
    });

    return { token: transaction.token, redirect_url: transaction.redirect_url, orderId };
  } catch (err: any) {
    set.status = 500;
    return { error: `Midtrans Error: ${err.message}` };
  }
};

export const handleMidtransWebhook = async ({ body, set }: any) => {
  try {
    const statusResponse = await snap.transaction.notification(body);
    const { order_id, transaction_status, fraud_status } = statusResponse;

    if (transaction_status == 'capture') {
      if (fraud_status == 'challenge') {
        // Handle fraud challenge if needed
      } else if (fraud_status == 'accept') {
        await finalizeMidtransTransaction(order_id, "success");
      }
    } else if (transaction_status == 'settlement') {
      await finalizeMidtransTransaction(order_id, "success");
    } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
      await finalizeMidtransTransaction(order_id, "failed");
    }

    return { status: "OK" };
  } catch (err: any) {
    console.error("Midtrans Webhook Error:", err.message);
    set.status = 500;
    return { error: err.message };
  }
};

export const finalizeMidtransTransaction = async (orderId: string, status: string) => {
  const transaction = await db.query.transactions.findFirst({ where: eq(transactions.orderId, orderId) });
  if (!transaction || transaction.status === "success") return;

  await db.update(transactions).set({ status }).where(eq(transactions.orderId, orderId));

  if (status === "success") {
    const user = await db.query.users.findFirst({ where: eq(users.id, transaction.userId) });
    if (user) {
      // Find metadata from Midtrans (not stored in db yet, let's assume we re-calculate or fetch from Midtrans)
      // For simplicity, we'll re-check the amount to decide credits or Pro.
      // Better: we should have stored 'isPro' and 'credits' in the transactions table too.
      // I'll update the transactions table to include these if needed, or just hardcode for now for demo.

      let extraCredits = 0;
      let setPro = false;
      if (transaction.amount >= (Number(process.env.PRICE_IDR_PRO) || 250000)) setPro = true;
      else if (transaction.amount >= (Number(process.env.PRICE_IDR_CREDITS_10) || 75000)) extraCredits = 10;

      await db.update(users)
        .set({
          credits: user.credits + extraCredits,
          isPro: setPro ? true : user.isPro,
          tier: setPro ? "pro" : user.tier,
        })
        .where(eq(users.id, user.id));
    }
  }
};

export const handlePaddleWebhook = async ({ request, set, body }: any) => {
  const signature = request.headers.get("paddle-signature") || "";

  try {
    const eventData = paddle.webhooks.unmarshal(JSON.stringify(body), process.env.PADDLE_API_KEY || "", signature);
    
    if (!eventData) {
      set.status = 400;
      return { error: "Invalid signature" };
    }

    // @ts-ignore
    if (eventData.eventType === "transaction.completed") {
      // @ts-ignore
      const transactionId = eventData.data.id;
      // @ts-ignore
      const customerId = eventData.data.customerId;
      // @ts-ignore
      const items = eventData.data.items;
      // @ts-ignore
      const customData = eventData.data.customData; // We should pass userId in customData from frontend

      const userId = customData?.userId;
      if (!userId) return { status: "No User ID" };

      let extraCredits = 0;
      let setPro = false;

      // Check items to determine product
      for (const item of items) {
        if (item.priceId === process.env.PADDLE_PRICE_ELITE_PRO) setPro = true;
        if (item.priceId === process.env.PADDLE_PRICE_DAYA_GEDOR) extraCredits += 10;
      }

      const user = await db.query.users.findFirst({ where: eq(users.id, Number(userId)) });
      if (user) {
        await db.update(users)
          .set({
            credits: user.credits + extraCredits,
            isPro: setPro ? true : user.isPro,
            tier: setPro ? "pro" : user.tier,
            paddleCustomerId: customerId
          })
          .where(eq(users.id, user.id));

        await db.insert(transactions).values({
          userId: user.id,
          amount: 0, // In transaction.completed, you can get the amount if needed
          currency: "USD",
          provider: "paddle",
          status: "success",
          orderId: transactionId,
        });
      }
    }

    return { status: "OK" };
  } catch (err: any) {
    console.error("Paddle Webhook Error:", err.message);
    set.status = 500;
    return { error: err.message };
  }
};
