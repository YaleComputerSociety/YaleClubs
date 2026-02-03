import { ABTestAssignment, ABTestEvent } from "./models/ABTest";
import connectToDatabase from "./mongodb";
import { readFileSync } from "fs";
import { join } from "path";
import crypto from "crypto";

// Interface for test configuration
interface TestConfig {
  name: string;
  variations: string[];
  description?: string;
}

interface TestsConfig {
  activeTests: TestConfig[];
}

// Load tests configuration
let testsConfig: TestsConfig | null = null;

function loadTestsConfig(): TestsConfig {
  if (testsConfig) {
    return testsConfig;
  }

  try {
    const configPath = join(process.cwd(), "ab-tests", "tests.json");
    const configFile = readFileSync(configPath, "utf-8");
    testsConfig = JSON.parse(configFile);
    return testsConfig as TestsConfig;
  } catch (error) {
    console.error("Error loading tests.json:", error);
    return { activeTests: [] };
  }
}

/**
 * Get the test configuration for a specific test name
 */
export function getTestConfig(testName: string): TestConfig | null {
  const config = loadTestsConfig();
  return config.activeTests.find((test) => test.name === testName) || null;
}

/**
 * Get all active tests
 */
export function getAllActiveTests(): TestConfig[] {
  const config = loadTestsConfig();
  return config.activeTests;
}

/**
 * Assign a variation to a user for a specific test
 * Uses consistent hashing to ensure the same user always gets the same variation
 */
function assignVariation(userId: string, testName: string, variations: string[]): string {
  const hash = crypto.createHash("sha256").update(`${userId}-${testName}`).digest("hex");
  const hashNumber = parseInt(hash.substring(0, 8), 16);
  const index = hashNumber % variations.length;
  return variations[index];
}

/**
 * Get or assign a variation for a user in a specific test
 * This function ensures consistency: a user always gets the same variation
 */
export async function getOrAssignVariation(userId: string, testName: string): Promise<string | null> {
  await connectToDatabase();

  const testConfig = getTestConfig(testName);
  if (!testConfig) {
    console.error(`Test ${testName} not found in configuration`);
    return null;
  }

  try {
    // Check if user already has an assignment
    let assignment = await ABTestAssignment.findOne({ userId, testName });

    if (assignment) {
      return assignment.variation;
    }

    // Assign new variation using consistent hashing
    const variation = assignVariation(userId, testName, testConfig.variations);

    // Store the assignment
    assignment = new ABTestAssignment({
      userId,
      testName,
      variation,
      assignedAt: new Date(),
    });

    await assignment.save();

    // Log the assignment event
    await logABTestEvent(userId, testName, variation, "assignment");

    return variation;
  } catch (error) {
    console.error("Error getting or assigning variation:", error);
    return null;
  }
}

/**
 * Log an A/B test event
 */
export async function logABTestEvent(
  userId: string,
  testName: string,
  variation: string,
  eventType: string,
  eventData?: Record<string, any>,
): Promise<void> {
  await connectToDatabase();

  try {
    const event = new ABTestEvent({
      userId,
      testName,
      variation,
      eventType,
      eventData: eventData || {},
      timestamp: new Date(),
    });

    await event.save();
  } catch (error) {
    console.error("Error logging A/B test event:", error);
  }
}

/**
 * Get the user's assigned variation from an existing assignment
 */
export async function getUserVariation(userId: string, testName: string): Promise<string | null> {
  await connectToDatabase();

  try {
    const assignment = await ABTestAssignment.findOne({ userId, testName });
    return assignment ? assignment.variation : null;
  } catch (error) {
    console.error("Error getting user variation:", error);
    return null;
  }
}

/**
 * Get analytics for a specific test
 */
export async function getTestAnalytics(testName: string) {
  await connectToDatabase();

  try {
    const assignments = await ABTestAssignment.aggregate([
      { $match: { testName } },
      { $group: { _id: "$variation", count: { $sum: 1 } } },
    ]);

    const events = await ABTestEvent.aggregate([
      { $match: { testName } },
      {
        $group: {
          _id: { variation: "$variation", eventType: "$eventType" },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      assignments: assignments.map((a) => ({ variation: a._id, count: a.count })),
      events: events.map((e) => ({
        variation: e._id.variation,
        eventType: e._id.eventType,
        count: e.count,
      })),
    };
  } catch (error) {
    console.error("Error getting test analytics:", error);
    return null;
  }
}

/**
 * Generate a unique anonymous user ID
 */
export function generateAnonymousUserId(): string {
  return `anon_${crypto.randomBytes(16).toString("hex")}`;
}
