import crypto from "crypto";
import dotenv from "dotenv";

// Load env from both possible locations
dotenv.config({ path: [".env.local", "../.env.local"], debug: true });

const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const PAYLOAD = JSON.stringify({
  id: 9999,
  order_number: 9999,
  name: "#9999",
  email: "test@local.dev",
  total_price: "10.00",
  subtotal_price: "10.00",
  total_tax: "0.00",
  currency: "USD",
  created_at: new Date().toISOString(),
  customer: {
    id: 12345,
    email: "test@local.dev",
    first_name: "Test",
    last_name: "User",
  },
  line_items: [
    {
      id: 1,
      product_id: 111,
      variant_id: 222,
      title: "Test Product",
      variant_title: "Default",
      quantity: 1,
      price: "10.00",
    },
  ],
  shipping_address: {
    address1: "123 Test St",
    city: "Test City",
    province: "Test State",
    country: "US",
    zip: "12345",
  },
  billing_address: {
    address1: "123 Test St",
    city: "Test City",
    province: "Test State",
    country: "US",
    zip: "12345",
  },
  financial_status: "pending",
  fulfillment_status: null,
  checkout_url: "https://test.myshopify.com/checkout/test",
  order_status_url: "https://test.myshopify.com/orders/9999",
});
const NGROK_URL =
  "https://nonimperial-valrie-graniferous.ngrok-free.dev/api/webhooks/orders/create";

console.log("=== Webhook Test Script ===");
console.log(
  "Secret loaded:",
  SECRET ? `${SECRET.substring(0, 20)}...` : "NOT FOUND"
);
console.log("Payload:", PAYLOAD);
console.log("");

if (!SECRET) {
  console.error("ERROR: SHOPIFY_WEBHOOK_SECRET not found in .env.local");
  console.log("Make sure .env.local exists in the project root with:");
  console.log(
    "SHOPIFY_WEBHOOK_SECRET=a941ebfe84295417b58b2514a4791ad0bbe8630d10db296ab55419f7cdf73581"
  );
  process.exit(1);
}

// Compute HMAC-SHA256 signature
const signature = crypto
  .createHmac("sha256", SECRET)
  .update(Buffer.from(PAYLOAD, "utf8"))
  .digest("base64");

console.log("Computed signature:", signature);
console.log("");

// Send POST request
const url = new URL(NGROK_URL);
const https = await import("https");

const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname + url.search,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Hmac-Sha256": signature,
    "Content-Length": Buffer.byteLength(PAYLOAD),
  },
};

console.log("Sending POST to:", NGROK_URL);
console.log("Headers:", options.headers);
console.log("");

const req = https.request(options, (res) => {
  console.log("=== Response ===");
  console.log("Status:", res.statusCode, res.statusMessage);
  console.log("Headers:", res.headers);
  console.log("");

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Body:", data || "(empty)");
    if (res.statusCode === 200) {
      console.log("\n✅ SUCCESS: Webhook accepted!");
    } else if (res.statusCode === 401) {
      console.log("\n❌ FAILED: 401 Unauthorized - HMAC verification failed");
      console.log("Check that:");
      console.log("1. Server is running with the correct .env.local");
      console.log("2. Secret matches exactly (no extra spaces)");
      console.log("3. Server was restarted after changing .env.local");
    } else {
      console.log(`\n⚠️  Unexpected status: ${res.statusCode}`);
    }
  });
});

req.on("error", (err) => {
  console.error("Request error:", err);
});

req.write(PAYLOAD);
req.end();
