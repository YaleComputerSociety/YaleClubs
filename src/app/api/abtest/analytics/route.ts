import { NextRequest, NextResponse } from "next/server";
import { getTestAnalytics, getAllActiveTests } from "@/lib/abTestUtils";

/**
 * GET /api/abtest/analytics?testName=homepage_layout
 * Gets analytics for a specific test or all tests
 *
 * Query parameters:
 * - testName (optional): specific test to get analytics for
 *
 * Response:
 * {
 *   "testName": "homepage_layout",
 *   "assignments": [
 *     { "variation": "A", "count": 100 },
 *     { "variation": "B", "count": 105 }
 *   ],
 *   "events": [
 *     { "variation": "A", "eventType": "view", "count": 100 },
 *     { "variation": "A", "eventType": "click", "count": 45 },
 *     { "variation": "B", "eventType": "view", "count": 105 },
 *     { "variation": "B", "eventType": "click", "count": 58 }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Check if user is authenticated (you may want to add admin role check)
    // const cookieStore = await cookies();
    // const userRole = cookieStore.get("auth_role")?.value;

    // Optional: Restrict analytics to admins only
    // Uncomment the following lines to enable admin-only access
    // if (userRole !== "admin") {
    //   return NextResponse.json(
    //     { error: "Unauthorized: Admin access required" },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const testName = searchParams.get("testName");

    if (testName) {
      // Get analytics for specific test
      const analytics = await getTestAnalytics(testName);

      if (!analytics) {
        return NextResponse.json({ error: "Test not found or error fetching analytics" }, { status: 404 });
      }

      return NextResponse.json({
        testName,
        ...analytics,
      });
    } else {
      // Get analytics for all active tests
      const activeTests = getAllActiveTests();
      const allAnalytics = await Promise.all(
        activeTests.map(async (test) => {
          const analytics = await getTestAnalytics(test.name);
          return {
            testName: test.name,
            description: test.description,
            variations: test.variations,
            ...analytics,
          };
        }),
      );

      return NextResponse.json({
        tests: allAnalytics,
      });
    }
  } catch (error) {
    console.error("Error in /api/abtest/analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
