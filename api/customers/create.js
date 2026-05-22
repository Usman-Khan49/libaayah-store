export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { firstName, lastName, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/customers.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          customer: {
            first_name: firstName || '',
            last_name: lastName || '',
            email,
            password,
            password_confirmation: password,
            verified_email: true,
            send_email_welcome: false,
          },
        }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      const messages = Object.entries(result.errors)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
        .join('; ');
      console.error('Shopify API errors:', result.errors);
      return res.status(400).json({ success: false, error: messages });
    }

    if (!result.customer) {
      return res.status(500).json({
        success: false,
        error: 'Unexpected response from Shopify',
      });
    }

    console.log('Customer created:', result.customer.email);
    return res.json({
      success: true,
      customer: {
        id: result.customer.id,
        email: result.customer.email,
        firstName: result.customer.first_name,
        lastName: result.customer.last_name,
      },
    });
  } catch (err) {
    console.error('Error creating customer:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
