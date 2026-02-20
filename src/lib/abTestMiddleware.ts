import { NextRequest, NextResponse } from "next/server";
import { getOrAssignVariation, generateAnonymousUserId } from "./abTestUtils";

/**
 * Middleware function to automatically assign A/B test variations
 * This can be used in the main middleware or in specific API routes
 *
 * @param request - Next.js request object
 * @param testNames - Array of test names to assign variations for
 * @returns Modified response with test assignments in headers
 */
export async function abTestMiddleware(
  request: NextRequest,
  response: NextResponse,
  testNames: string[],
): Promise<NextResponse> {
  // Get user ID from auth cookie or create/retrieve anonymous ID
  let userId = request.cookies.get("auth_netid")?.value;

  if (!userId) {
    userId = request.cookies.get("ab_user_id")?.value;

    if (!userId) {
      userId = generateAnonymousUserId();
      response.cookies.set("ab_user_id", userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
    }
  }

  // Assign variations for all requested tests
  const assignments: Record<string, string> = {};

  for (const testName of testNames) {
    try {
      const variation = await getOrAssignVariation(userId, testName);
      if (variation) {
        assignments[testName] = variation;
      }
    } catch (error) {
      console.error(`Error assigning variation for test ${testName}:`, error);
    }
  }

  // Add assignments to response headers (can be read by client)
  if (Object.keys(assignments).length > 0) {
    response.headers.set("X-AB-Tests", JSON.stringify(assignments));
  }

  return response;
}

/**
 * Helper function to apply A/B test middleware to specific routes
 * Usage in API route:
 *
 * export async function GET(request: NextRequest) {
 *   const response = NextResponse.next();
 *   await applyABTestMiddleware(request, response, ["homepage_layout"]);
 *   // ... rest of route handler
 * }
 */
export async function applyABTestMiddleware(
  request: NextRequest,
  response: NextResponse,
  testNames: string[],
): Promise<NextResponse> {
  return abTestMiddleware(request, response, testNames);
}

/**
 * Extracts A/B test assignments from request headers
 * Useful for reading assignments set by middleware
 */
export function getABTestAssignments(request: NextRequest): Record<string, string> {
  const assignmentsHeader = request.headers.get("X-AB-Tests");

  if (!assignmentsHeader) {
    return {};
  }

  try {
    return JSON.parse(assignmentsHeader);
  } catch (error) {
    console.error("Error parsing AB test assignments:", error);
    return {};
  }
}
