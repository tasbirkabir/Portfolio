import { NextResponse } from "next/server";
import { getGateways, getActiveGateway, isLiveMode } from "@/lib/payments/config";

/** Returns which payment gateways are configured + available methods. */
export async function GET() {
  const gateways = getGateways();
  const active = getActiveGateway();
  return NextResponse.json({
    active: active?.id || "mock",
    isLive: isLiveMode(),
    gateways: gateways.map((g) => ({
      id: g.id,
      name: g.name,
      methods: g.methods,
      configured: g.configured,
    })),
    // Flatten to unique methods from the active gateway
    methods: active?.methods || ["bkash", "nagad", "rocket", "card"],
  });
}
