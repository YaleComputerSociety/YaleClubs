import { NextRequest, NextResponse } from "next/server";
import { applyABTestMiddleware } from "@/lib/abTestMiddleware";

/**
 * EXAMPLE API ROUTE demonstrating A/B test middleware usage
 *
 * This route automatically assigns users to test variations
 * and returns the assignments in the response
 *
 * GET /api/abtest/example
 */
export async function GET(request: NextRequest) {
  // Create initial response
  const response = NextResponse.json({
    message: "This is an example route with A/B testing",
    timestamp: new Date().toISOString(),
  });

  // Apply A/B test middleware for specific tests
  // This will automatically assign variations to the user
  await applyABTestMiddleware(request, response, ["homepage_layout", "event_card_design", "cta_button_color"]);

  // The assignments are now available in the response headers
  // Client can read them from X-AB-Tests header

  return response;
}
