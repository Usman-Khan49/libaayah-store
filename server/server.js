import express from "express";
import dotenv from "dotenv";
import firebaseAdmin from "firebase-admin";
import { verifyToken, clerkClient } from "@clerk/clerk-sdk-node";

import cors from "cors";
import crypto from "crypto";

dotenv.config({ path: [".env.local"], debug: true });

const app = express();

const PORT = process.env.PORT;

// Apply JSON parsing to all routes EXCEPT webhooks
// Webhooks need raw body for HMAC verification
app.use((req, res, next) => {
  if (req.path.startsWith("/api/webhooks/")) {
    next(); // Skip JSON parsing for webhooks
  } else {
    express.json()(req, res, next);
  }
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
// let clerk;
// try {
//   clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
// } catch (error) {
//   console.log("Clerk Error " + error);
// }

try {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
}

const database = firebaseAdmin.firestore();

app.post("/api/syncUser", async (req, res) => {
  const { sessionToken, cartID } = req.body;

  const verifiedTokken = await verifyToken(sessionToken, {
    jwtKey: process.env.CLERK_JWT_KEY,
    authorizedParties: [process.env.CLIENT_ORIGIN],
  });

  const userID = verifiedTokken.sub;
  const sessionID = verifiedTokken.sid;

  const user = await clerkClient.users.getUser(userID);
  const userEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    null;

  console.log("User email:", userEmail);
  console.log("UserID:", userID, "SessionID:", sessionID);

  try {
    const result = await database.doc(`Users/${userID}`).set(
      {
        userID: userID,
        userEmail: userEmail,
        sessionID: sessionID,
        cartID: cartID,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log("User sync completed successfully");
    res.status(200).json({ success: true, userId: userID, email: userEmail });
  } catch (error) {
    console.error("Database write error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Cart Management Endpoints
// ========================================

/**
 * Get cart ID for a user
 */
app.post("/api/cart/get", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  try {
    const userDoc = await database.doc(`Users/${userId}`).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const cartId = userDoc.data()?.cartID || null;
    res.status(200).json({ success: true, cartId });
  } catch (error) {
    console.error("Error getting cart ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Save cart ID for a user
 */
app.post("/api/cart/save", async (req, res) => {
  const { userId, cartId } = req.body;

  console.log("Received save cart request:", { userId, cartId });

  if (!userId || !cartId) {
    return res
      .status(400)
      .json({ success: false, error: "Missing userId or cartId" });
  }

  try {
    await database.doc(`Users/${userId}`).set(
      {
        cartID: cartId,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("Cart ID saved successfully to Firestore for user:", userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving cart ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete cart ID for a user
 */
app.post("/api/cart/delete", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, error: "Missing userId" });
  }

  try {
    await database.doc(`Users/${userId}`).update({
      cartID: firebaseAdmin.firestore.FieldValue.delete(),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting cart ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Order Management Endpoints
// ========================================

/**
 * Get all orders for a user
 */
app.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get user's email from Firestore
    const userDoc = await database.doc(`Users/${userId}`).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userEmail = userDoc.data()?.userEmail;

    if (!userEmail) {
      return res
        .status(400)
        .json({ success: false, error: "User email not found" });
    }

    // Get orders from Firestore by email
    const ordersSnapshot = await database
      .collection("Orders")
      .where("email", "==", userEmail)
      .orderBy("createdAt", "desc")
      .get();

    const orders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single order details
 */
app.get("/api/orders/:userId/:orderId", async (req, res) => {
  const { userId, orderId } = req.params;

  try {
    const orderDoc = await database.collection("Orders").doc(orderId).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const order = { id: orderDoc.id, ...orderDoc.data() };

    // Verify order belongs to user
    const userDoc = await database.doc(`Users/${userId}`).get();
    if (order.email !== userDoc.data()?.userEmail) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// Shopify Webhook Endpoints
// ========================================

/**
 * Verify Shopify webhook authenticity using HMAC-SHA256
 * Returns true when verification passes, false otherwise.
 * If SHOPIFY_WEBHOOK_SECRET is not set, this function will log a warning and
 * return true to preserve existing behavior in development.
 */
function verifyShopifyWebhook(req) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  console.log("[DEBUG] HMAC Verification:");
  console.log(
    "  Secret loaded:",
    secret ? `${secret.substring(0, 20)}...` : "NOT FOUND"
  );

  if (!secret) {
    console.warn(
      "SHOPIFY_WEBHOOK_SECRET is not set — skipping webhook HMAC verification"
    );
    return true;
  }

  const hmacHeader =
    req.get("x-shopify-hmac-sha256") || req.get("X-Shopify-Hmac-Sha256");
  console.log(
    "  Header HMAC:",
    hmacHeader ? hmacHeader.substring(0, 30) + "..." : "MISSING"
  );

  if (!hmacHeader) {
    console.warn("Missing x-shopify-hmac-sha256 header on webhook request");
    return false;
  }

  const body = req.body; // express.raw gives a Buffer
  console.log("  Body length:", body.length, "bytes");
  console.log("  Body string:", body.toString("utf8").substring(0, 100));

  try {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("base64");

    console.log("  Computed HMAC:", digest.substring(0, 30) + "...");

    const digestBuf = Buffer.from(digest, "base64");
    const headerBuf = Buffer.from(hmacHeader, "base64");

    if (digestBuf.length !== headerBuf.length) {
      console.warn(
        "  HMAC length mismatch:",
        digestBuf.length,
        "vs",
        headerBuf.length
      );
      return false;
    }

    const result = crypto.timingSafeEqual(digestBuf, headerBuf);
    console.log("  Verification result:", result ? "✅ PASS" : "❌ FAIL");
    return result;
  } catch (err) {
    console.error("Error verifying Shopify webhook HMAC:", err);
    return false;
  }
}

/**
 * Webhook: Order Created
 */
app.post(
  "/api/webhooks/orders/create",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // Verify webhook signature
      if (!verifyShopifyWebhook(req)) {
        console.warn("Rejected orders/create webhook due to invalid signature");
        return res.status(401).send("Unauthorized");
      }
      // Parse the JSON body
      const raw = req.body.toString("utf8");
      const order = JSON.parse(raw);

      console.log("📦 Order created webhook received:", order.id);

      // Save order to Firestore
      await database
        .collection("Orders")
        .doc(order.id.toString())
        .set({
          orderId: order.id,
          orderNumber: order.order_number,
          name: order.name,
          email: order.email,
          totalPrice: order.total_price,
          subtotalPrice: order.subtotal_price,
          totalTax: order.total_tax,
          currency: order.currency,
          createdAt: order.created_at,
          customer: order.customer
            ? {
                id: order.customer.id,
                email: order.customer.email,
                firstName: order.customer.first_name,
                lastName: order.customer.last_name,
              }
            : null,
          lineItems: order.line_items.map((item) => ({
            id: item.id,
            productId: item.product_id,
            variantId: item.variant_id,
            title: item.title,
            variantTitle: item.variant_title,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: order.shipping_address,
          billingAddress: order.billing_address,
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          checkoutUrl: order.checkout_url,
          orderStatusUrl: order.order_status_url,
        });

      console.log("✅ Order saved to Firestore:", order.id);
      res.status(200).send("OK");
    } catch (error) {
      console.error("❌ Error processing order webhook:", error);
      res.status(500).send("Error");
    }
  }
);

/**
 * Webhook: Order Paid
 */
app.post(
  "/api/webhooks/orders/paid",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // Verify webhook signature
      if (!verifyShopifyWebhook(req)) {
        console.warn("Rejected orders/paid webhook due to invalid signature");
        return res.status(401).send("Unauthorized");
      }

      const raw = req.body.toString("utf8");
      const order = JSON.parse(raw);

      console.log("💰 Order paid webhook received:", order.id);

      // Update order status in Firestore
      await database.collection("Orders").doc(order.id.toString()).update({
        financialStatus: "paid",
        paidAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Order payment status updated:", order.id);
      res.status(200).send("OK");
    } catch (error) {
      console.error("❌ Error processing paid webhook:", error);
      res.status(500).send("Error");
    }
  }
);

/**
 * Webhook: Order Fulfilled
 */
app.post(
  "/api/webhooks/orders/fulfilled",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // Verify webhook signature
      if (!verifyShopifyWebhook(req)) {
        console.warn(
          "Rejected orders/fulfilled webhook due to invalid signature"
        );
        return res.status(401).send("Unauthorized");
      }

      const raw = req.body.toString("utf8");
      const order = JSON.parse(raw);

      console.log("📬 Order fulfilled webhook received:", order.id);

      // Update order fulfillment status
      await database.collection("Orders").doc(order.id.toString()).update({
        fulfillmentStatus: order.fulfillment_status,
        fulfilledAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Order fulfillment status updated:", order.id);
      res.status(200).send("OK");
    } catch (error) {
      console.error("❌ Error processing fulfillment webhook:", error);
      res.status(500).send("Error");
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
