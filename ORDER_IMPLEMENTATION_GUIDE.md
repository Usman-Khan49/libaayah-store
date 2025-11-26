# Order Management & Testing Implementation Guide

## 🧪 Phase 1: Enable Test Checkout & Payments

### Step 1: Configure Shopify Test Payments

1. **Go to Shopify Admin** → Settings → Payments
2. **Enable Shopify Payments Test Mode** OR use Bogus Gateway:

   **Option A: Shopify Payments (Test Mode)**

   - If you have Shopify Payments enabled, switch to test mode
   - Test card: `1` (Visa) - Any future expiry, any CVV
   - This creates real test orders in your store

   **Option B: Bogus Gateway (Recommended for Development)**

   - Search for "Bogus Gateway" in payment providers
   - Activate it (free for testing)
   - Test cards:
     - `1` = Success
     - `2` = Failure
     - `3` = Exception

3. **Disable Password Protection**
   - Online Store → Preferences
   - Uncheck "Restrict access to visitors with the password"
   - This allows checkout to work without password

### Step 2: Test Complete User Journey

**As a Guest:**

```
1. Browse products → Add to cart → View cart
2. Click "Proceed to Checkout"
3. Fill shipping address
4. Use test payment (card: 1)
5. Complete order
6. Verify order appears in Shopify Admin
```

**As Authenticated User:**

```
1. Sign up with Clerk → Verify user in Firestore
2. Browse products → Add to cart → View cart
3. Cart ID saved to Firestore
4. Click "Proceed to Checkout"
5. Shopify recognizes logged-in user
6. Complete order with test payment
7. Verify order in Shopify Admin
```

---

## 📦 Phase 2: Shopify Order Webhooks

### What Are Webhooks?

Webhooks are HTTP callbacks that Shopify sends to your server when events happen (order created, order paid, order fulfilled, etc.)

### Step 1: Set Up Webhook Endpoints

**File: `server/server.js`**

Add these endpoints:

```javascript
// Webhook endpoint for order creation
app.post("/api/webhooks/orders/create", async (req, res) => {
  // Verify webhook authenticity
  const hmac = req.headers["x-shopify-hmac-sha256"];
  const verified = verifyShopifyWebhook(req.body, hmac);

  if (!verified) {
    return res.status(401).send("Unauthorized");
  }

  const order = req.body;
  console.log("Order created:", order.id);

  // Save order to Firestore
  await database.collection("Orders").doc(order.id.toString()).set({
    orderId: order.id,
    orderNumber: order.order_number,
    email: order.email,
    totalPrice: order.total_price,
    createdAt: order.created_at,
    customer: order.customer,
    lineItems: order.line_items,
    shippingAddress: order.shipping_address,
    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
  });

  res.status(200).send("OK");
});

// Webhook endpoint for order payment
app.post("/api/webhooks/orders/paid", async (req, res) => {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  const verified = verifyShopifyWebhook(req.body, hmac);

  if (!verified) {
    return res.status(401).send("Unauthorized");
  }

  const order = req.body;

  // Update order status in Firestore
  await database.collection("Orders").doc(order.id.toString()).update({
    financialStatus: "paid",
    paidAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  });

  res.status(200).send("OK");
});

// Webhook verification function
function verifyShopifyWebhook(body, hmac) {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("base64");
  return hash === hmac;
}
```

### Step 2: Register Webhooks in Shopify

**Option A: Via Shopify Admin (Manual)**

1. Settings → Notifications → Webhooks
2. Create webhook:
   - Event: `Order creation`
   - URL: `https://your-server.com/api/webhooks/orders/create`
   - Format: JSON

**Option B: Via API (Automated)**

```javascript
// Script to register webhooks
const shopifyWebhookUrl = `https://${SHOPIFY_STORE}.myshopify.com/admin/api/2024-10/webhooks.json`;

const webhooks = [
  {
    topic: "orders/create",
    address: "https://your-server.com/api/webhooks/orders/create",
    format: "json",
  },
  {
    topic: "orders/paid",
    address: "https://your-server.com/api/webhooks/orders/paid",
    format: "json",
  },
];
```

### Step 3: Test Webhooks Locally

**Use ngrok to expose local server:**

```powershell
# Install ngrok
choco install ngrok

# Start your server
cd server
node server.js

# In another terminal, expose it
ngrok http 3001

# Use the ngrok URL (e.g., https://abc123.ngrok.io) in Shopify webhooks
```

---

## 📋 Phase 3: Order History API

### Backend Endpoints

**File: `server/server.js`**

```javascript
/**
 * Get all orders for a user
 */
app.get("/api/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get user's email from Firestore
    const userDoc = await database.doc(`Users/${userId}`).get();
    const userEmail = userDoc.data()?.userEmail;

    if (!userEmail) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get orders from Firestore by email
    const ordersSnapshot = await database
      .collection("Orders")
      .where("email", "==", userEmail)
      .orderBy("createdAt", "desc")
      .get();

    const orders = ordersSnapshot.docs.map((doc) => doc.data());

    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderDoc.data();

    // Verify order belongs to user
    const userDoc = await database.doc(`Users/${userId}`).get();
    if (order.email !== userDoc.data()?.userEmail) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🗄️ Phase 4: Inventory Tracking

### Backend: Sync Inventory from Shopify

```javascript
/**
 * Get product inventory levels
 */
app.get("/api/inventory/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    // Query Shopify for inventory
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/inventory_levels.json?inventory_item_ids=${productId}`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Webhook for inventory updates
 */
app.post("/api/webhooks/inventory/update", async (req, res) => {
  const inventory = req.body;

  // Update Firestore cache
  await database
    .collection("Inventory")
    .doc(inventory.inventory_item_id.toString())
    .set({
      available: inventory.available,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

  res.status(200).send("OK");
});
```

---

## 📝 Implementation Checklist

### Week 1: Setup & Testing

- [ ] Enable Bogus Gateway in Shopify
- [ ] Disable password protection
- [ ] Test guest checkout flow
- [ ] Test authenticated user checkout
- [ ] Verify orders appear in Shopify Admin
- [ ] Install ngrok for webhook testing

### Week 2: Webhooks

- [ ] Add webhook verification function
- [ ] Create `/api/webhooks/orders/create` endpoint
- [ ] Create `/api/webhooks/orders/paid` endpoint
- [ ] Register webhooks in Shopify
- [ ] Test webhooks with ngrok
- [ ] Verify order data saves to Firestore

### Week 3: Order History

- [ ] Create `/api/orders/:userId` endpoint
- [ ] Create `/api/orders/:userId/:orderId` endpoint
- [ ] Build Order History page (frontend)
- [ ] Build Order Detail page (frontend)
- [ ] Test order retrieval

### Week 4: Inventory

- [ ] Create inventory endpoints
- [ ] Set up inventory webhooks
- [ ] Add "low stock" warnings to UI
- [ ] Cache inventory in Firestore

---

## 🧪 Testing Scenarios

### Scenario 1: Guest Purchase

```
1. Add items to cart (guest)
2. Checkout → Fill address
3. Pay with test card (1)
4. Webhook fires → Order saved to Firestore
5. Verify order in Firestore
```

### Scenario 2: Authenticated Purchase

```
1. Sign in
2. Cart syncs from Firestore
3. Add more items
4. Checkout → Address pre-filled
5. Pay with test card
6. Webhook fires → Order linked to user email
7. View order in Order History page
```

### Scenario 3: Failed Payment

```
1. Attempt checkout with card "2"
2. Payment fails
3. User stays on checkout
4. No webhook fired
5. No order created
```

---

## 🚀 Next Steps

Ready to start? Here's the order:

1. **First**: Enable Bogus Gateway and test checkout manually
2. **Second**: I'll create the webhook endpoints in your server
3. **Third**: Set up ngrok and register webhooks
4. **Fourth**: Build Order History API and UI

Let me know when you're ready to start, and I'll guide you through each step! 🎯
