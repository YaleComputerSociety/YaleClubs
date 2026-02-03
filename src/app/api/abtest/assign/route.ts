import { NextRequest, NextResponse } from "next/server";
import { getOrAssignVariation, generateAnonymousUserId } from "@/lib/abTestUtils";
import { cookies } from "next/headers";

/**
 * POST /api/abtest/assign
 * Assigns or retrieves a variation for a user in a specific test
 *
 * Request body:
 * {
 *   "testName": "homepage_layout"
 * }
 *
 * Response:
 * {
 *   "testName": "homepage_layout",
 *   "variation": "A",
 *   "userId": "abc123"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testName } = body;

    if (!testName) {
      return NextResponse.json({ error: "testName is required" }, { status: 400 });
    }

    const cookieStore = await cookies();

    // Get user ID from auth cookie or create anonymous ID
    let userId = cookieStore.get("auth_netid")?.value;

    if (!userId) {
      // Check if user already has an anonymous ID
      userId = cookieStore.get("ab_user_id")?.value;

      if (!userId) {
        // Generate new anonymous ID
        userId = generateAnonymousUserId();
      }
    }

    // Get or assign variation
    const variation = await getOrAssignVariation(userId, testName);

    if (!variation) {
      return NextResponse.json({ error: "Test not found or error assigning variation" }, { status: 404 });
    }

    // Create response with variation
    const response = NextResponse.json({
      testName,
      variation,
      userId,
    });

    // Set anonymous user ID cookie if user is not authenticated
    if (!cookieStore.get("auth_netid")) {
      response.cookies.set("ab_user_id", userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error("Error in /api/abtest/assign:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
