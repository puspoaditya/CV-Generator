import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { handleMidtransCheckout, handleMidtransWebhook, handlePaddleWebhook } from "../controllers/payment_controller";

export const paymentRoutes = new Elysia({ prefix: "/payments" })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'supersecret'
    })
  )
  .post("/checkout/midtrans", async ({ body, jwt, request, set }: any) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const token = authHeader.split(" ")[1];
    const payload = await jwt.verify(token);
    return await handleMidtransCheckout({ body, payload, set });
  }, {
    body: t.Object({ plan: t.String() })
  })
  .post("/bypass-success", async ({ body, set }: any) => {
    // This is a test-only endpoint to bypass real payments
    const { orderId } = body;
    const { finalizeMidtransTransaction } = require("../controllers/payment_controller");
    await finalizeMidtransTransaction(orderId, "success");
    return { status: "Bypass Success", orderId };
  }, {
    body: t.Object({ orderId: t.String() })
  })
  .post("/webhook/midtrans", handleMidtransWebhook as any)
  .post("/webhook/paddle", handlePaddleWebhook as any);
