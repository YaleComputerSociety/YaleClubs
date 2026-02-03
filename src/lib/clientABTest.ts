/**
 * Client-side utilities for A/B testing
 * These functions should be used in React components
 */

/**
 * Get a variation assignment for a test
 * This calls the API to get or assign a variation
 *
 * @param testName - Name of the test
 * @returns Promise resolving to the variation string or null
 */
export async function getABTestVariation(testName: string): Promise<string | null> {
  try {
    const response = await fetch("/api/abtest/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ testName }),
    });

    if (!response.ok) {
      console.error("Error getting AB test variation:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.variation;
  } catch (error) {
    console.error("Error getting AB test variation:", error);
    return null;
  }
}

/**
 * Log an event for A/B testing
 * This should be called when a user performs the target action
 *
 * @param testName - Name of the test
 * @param eventType - Type of event (e.g., "click", "view", "conversion")
 * @param eventData - Optional additional data about the event
 */
export async function logABTestEvent(
  testName: string,
  eventType: string,
  eventData?: Record<string, any>,
): Promise<void> {
  try {
    const response = await fetch("/api/abtest/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        testName,
        eventType,
        eventData,
      }),
    });

    if (!response.ok) {
      console.error("Error logging AB test event:", response.statusText);
    }
  } catch (error) {
    console.error("Error logging AB test event:", error);
  }
}

/**
 * React Hook for A/B testing
 * Usage:
 *
 * const { variation, logEvent } = useABTest("homepage_layout");
 *
 * // Render based on variation
 * if (variation === "A") {
 *   return <LayoutA />;
 * } else if (variation === "B") {
 *   return <LayoutB />;
 * }
 *
 * // Log events
 * <button onClick={() => logEvent("click_follow_button", { clubId: "123" })}>
 *   Follow
 * </button>
 */
export function useABTest(testName: string) {
  const [variation, setVariation] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getABTestVariation(testName).then((v) => {
      setVariation(v);
      setLoading(false);
    });
  }, [testName]);

  const logEvent = React.useCallback(
    (eventType: string, eventData?: Record<string, any>) => {
      logABTestEvent(testName, eventType, eventData);
    },
    [testName],
  );

  return { variation, loading, logEvent };
}

// Need to import React for the hook
import React from "react";
