import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: [".env.local"], debug: true });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

// ========================================
// Shopify Admin REST API — Customer Creation
// ========================================
// Uses the REST Admin API (not GraphQL) because only REST supports
// password + password_confirmation + send_email_welcome: false.

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN; // e.g. my-store.myshopify.com
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = "2024-10";

/**
 * POST /api/customers/create
 * Body: { firstName, lastName, email, password }
 *
 * Creates a customer via Admin REST API with a password already set
 * and send_email_welcome: false so Shopify won't send any activation
 * or welcome email.
 */
app.post("/api/customers/create", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password are required" });
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({
          customer: {
            first_name: firstName || "",
            last_name: lastName || "",
            email,
            password,
            password_confirmation: password,
            verified_email: true,
            send_email_welcome: false,
          },
        }),
      },
    );

    const result = await response.json();

    if (result.errors) {
      // Shopify REST returns errors as an object like { "email": ["has already been taken"] }
      const messages = Object.entries(result.errors)
        .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        .join("; ");
      console.error("Admin API errors:", result.errors);
      return res.status(400).json({ success: false, error: messages });
    }

    if (!result.customer) {
      return res
        .status(500)
        .json({ success: false, error: "Unexpected response from Shopify" });
    }

    console.log("Customer created via Admin API:", result.customer.email);
    res.json({
      success: true,
      customer: {
        id: result.customer.id,
        email: result.customer.email,
        firstName: result.customer.first_name,
        lastName: result.customer.last_name,
      },
    });
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
