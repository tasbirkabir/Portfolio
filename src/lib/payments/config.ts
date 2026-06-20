/**
 * Payment Gateway Configuration
 *
 * Set these environment variables in your .env file to enable live payments.
 * The checkout will automatically show only the gateways you've configured.
 *
 * --- SSL Commerz (Bangladesh: bKash, Nagad, Rocket, Cards) ---
 * SSLCOMMERZ_STORE_ID=your_store_id
 * SSLCOMMERZ_STORE_PASSWD=your_store_password
 * SSLCOMMERZ_SANDBOX=true  (set to "false" for production)
 *
 * --- Stripe (International: Cards, Apple Pay, Google Pay) ---
 * STRIPE_SECRET_KEY=sk_live_xxx  (or sk_test_xxx for testing)
 * STRIPE_PUBLISHABLE_KEY=pk_live_xxx  (or pk_test_xxx)
 * STRIPE_WEBHOOK_SECRET=whsec_xxx
 *
 * --- UddoktaPay (Bangladesh: bKash, Nagad, Rocket) ---
 * UDDOKTAPAY_API_KEY=your_api_key
 * UDDOKTAPAY_BASE_URL=https://api.uddoktapay.com
 *
 * --- Site URL (for redirects/webhooks) ---
 * NEXT_PUBLIC_SITE_URL=https://tasbirkabir.site
 */

export type GatewayId = "sslcommerz" | "stripe" | "uddoktapay" | "mock";

export type GatewayConfig = {
  id: GatewayId;
  name: string;
  methods: string[];
  configured: boolean;
};

export function getGateways(): GatewayConfig[] {
  const gateways: GatewayConfig[] = [];

  // SSL Commerz
  gateways.push({
    id: "sslcommerz",
    name: "SSL Commerz",
    methods: ["bkash", "nagad", "rocket", "card"],
    configured: !!(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWD),
  });

  // Stripe
  gateways.push({
    id: "stripe",
    name: "Stripe",
    methods: ["card"],
    configured: !!process.env.STRIPE_SECRET_KEY,
  });

  // UddoktaPay
  gateways.push({
    id: "uddoktapay",
    name: "UddoktaPay",
    methods: ["bkash", "nagad", "rocket"],
    configured: !!(process.env.UDDOKTAPAY_API_KEY && process.env.UDDOKTAPAY_BASE_URL),
  });

  // Mock (always available — simulates payment for demo/dev)
  gateways.push({
    id: "mock",
    name: "Demo",
    methods: ["bkash", "nagad", "rocket", "card"],
    configured: true,
  });

  return gateways;
}

export function getActiveGateway(): GatewayConfig | null {
  // Priority: SSL Commerz > Stripe > UddoktaPay > Mock
  const gateways = getGateways();
  return (
    gateways.find((g) => g.id === "sslcommerz" && g.configured) ||
    gateways.find((g) => g.id === "stripe" && g.configured) ||
    gateways.find((g) => g.id === "uddoktapay" && g.configured) ||
    gateways.find((g) => g.id === "mock") ||
    null
  );
}

export function isLiveMode(): boolean {
  return getActiveGateway()?.id !== "mock";
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
