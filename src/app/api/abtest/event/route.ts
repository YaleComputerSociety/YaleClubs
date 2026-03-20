import { NextRequest, NextResponse } from "next/server";
import { logABTestEvent, getUserVariation } from "@/lib/abTestUtils";
import { cookies } from "next/headers";

/**
 * POST /api/abtest/event
 * Logs an event for A/B testing
 *
 * Request body:
 * {
 *   "testName": "homepage_layout",
 *   "eventType": "click_follow_button",
 *   "eventData": { "clubId": "abc123" } // optional
 * }
 *
 * Response:
 * {
 *   "success": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testName, eventType, eventData } = body;

    if (!testName || !eventType) {
      return NextResponse.json({ error: "testName and eventType are required" }, { status: 400 });
    }

    const cookieStore = await cookies();

    // Get user ID from auth cookie or anonymous cookie
    const userId = cookieStore.get("auth_netid")?.value || cookieStore.get("ab_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Get user's assigned variation for this test
    const variation = await getUserVariation(userId, testName);

    if (!variation) {
      return NextResponse.json({ error: "No variation assignment found for this user and test" }, { status: 404 });
    }

    // Log the event asynchronously (non-blocking)
    logABTestEvent(userId, testName, variation, eventType, eventData).catch((err) => {
      console.error("Failed to log A/B test event:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/abtest/event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
