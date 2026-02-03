# A/B Testing Infrastructure - Milestone Documentation

## Overview
This milestone implements a comprehensive A/B testing infrastructure for the YClubs application. The infrastructure allows developers to easily create, manage, and analyze A/B tests to optimize user experience and measure conversion rates.

## Date Completed
February 2, 2026

## Changes Made

### 1. Configuration Files

#### `ab-tests/tests.json`
- **Purpose**: Central configuration file defining all active A/B tests
- **Structure**: Contains an array of test objects, each with:
  - `name`: Unique identifier for the test
  - `variations`: Array of variation names (e.g., ["A", "B"])
  - `description`: Human-readable description of the test
- **Example Tests Configured**:
  - `homepage_layout`: Testing different homepage layouts (variations: A, B)
  - `event_card_design`: Testing event card designs (variations: compact, detailed)
  - `cta_button_color`: Testing CTA button colors (variations: blue, green, red)

### 2. Database Models

#### `src/lib/models/ABTest.ts`
Created two Mongoose models for storing A/B test data:

**ABTestAssignment Model**:
- Stores which variation each user is assigned to
- Fields: `userId`, `testName`, `variation`, `assignedAt`
- Ensures consistency: one assignment per user per test (unique compound index)
- Supports both authenticated users (netid) and anonymous users (generated UUID)

**ABTestEvent Model**:
- Logs all events related to A/B tests
- Fields: `userId`, `testName`, `variation`, `eventType`, `eventData`, `timestamp`
- Indexed for efficient querying and analytics
- Tracks user actions like views, clicks, conversions, etc.

### 3. Core Utility Functions

#### `src/lib/abTestUtils.ts`
Comprehensive utility module providing:

**Key Functions**:
- `loadTestsConfig()`: Loads and caches test configuration from tests.json
- `getTestConfig(testName)`: Retrieves configuration for a specific test
- `getAllActiveTests()`: Returns all active tests from configuration
- `assignVariation(userId, testName, variations)`: Uses consistent hashing (SHA-256) to assign variations deterministically
- `getOrAssignVariation(userId, testName)`: Gets existing or assigns new variation to user
- `logABTestEvent(userId, testName, variation, eventType, eventData)`: Logs test-related events
- `getUserVariation(userId, testName)`: Retrieves user's current variation assignment
- `getTestAnalytics(testName)`: Aggregates analytics data for a test
- `generateAnonymousUserId()`: Creates unique IDs for unauthenticated users

**Key Features**:
- Consistent hashing ensures same user always gets same variation
- Automatic logging of assignment events
- Support for both authenticated and anonymous users
- Database connection management

### 4. Middleware Functions

#### `src/lib/abTestMiddleware.ts`
Middleware utilities for automatic test assignment:

**abTestMiddleware Function**:
- Automatically assigns variations to users for specified tests
- Handles user identification (authenticated or anonymous)
- Sets anonymous user ID cookie for unauthenticated users
- Adds test assignments to response headers (X-AB-Tests)
- Can be applied to any API route or globally

**applyABTestMiddleware Function**:
- Helper for applying A/B test middleware to specific routes
- Simplifies integration in API handlers

**getABTestAssignments Function**:
- Extracts test assignments from request headers
- Useful for reading middleware-assigned variations

### 5. Client-Side Utilities

#### `src/lib/clientABTest.ts`
React-friendly utilities for frontend A/B testing:

**Functions**:
- `getABTestVariation(testName)`: Fetches variation assignment from API
- `logABTestEvent(testName, eventType, eventData)`: Logs events from client
- `useABTest(testName)`: React hook for easy component integration

**useABTest Hook Features**:
- Automatic variation fetching on component mount
- Loading state management
- Memoized event logging function
- Simple, declarative API for components

### 6. API Routes

Created three API endpoints for A/B testing:

#### `src/app/api/abtest/assign/route.ts`
- **Method**: POST
- **Purpose**: Assigns or retrieves a variation for a user
- **Request**: `{ "testName": "homepage_layout" }`
- **Response**: `{ "testName": "homepage_layout", "variation": "A", "userId": "abc123" }`
- **Features**:
  - Handles both authenticated and anonymous users
  - Sets anonymous user ID cookie
  - Returns consistent variation for returning users

#### `src/app/api/abtest/event/route.ts`
- **Method**: POST
- **Purpose**: Logs events for analytics
- **Request**: `{ "testName": "homepage_layout", "eventType": "click_follow_button", "eventData": { "clubId": "abc123" } }`
- **Response**: `{ "success": true }`
- **Features**:
  - Validates user has variation assignment
  - Logs events with optional metadata
  - Tracks user actions for conversion analysis

#### `src/app/api/abtest/analytics/route.ts`
- **Method**: GET
- **Purpose**: Retrieves analytics data for tests
- **Query Params**: `testName` (optional)
- **Response**: Aggregated data showing variation assignments and event counts
- **Features**:
  - Get analytics for specific test or all tests
  - Aggregates assignment counts by variation
  - Groups events by variation and event type
  - Can be restricted to admin users (commented out for now)

#### `src/app/api/abtest/example/route.ts`
- **Method**: GET
- **Purpose**: Example demonstrating middleware usage
- **Shows**: How to integrate A/B test middleware in any API route

## Architecture Highlights

### Consistent User Assignment
- Uses SHA-256 hashing of `userId + testName` to deterministically assign variations
- Ensures user always sees same variation across sessions
- Works with both authenticated (netid) and anonymous users

### User Identification
- **Authenticated Users**: Uses `auth_netid` cookie
- **Anonymous Users**: Generates and stores UUID in `ab_user_id` cookie (1-year expiry)
- Seamless transition: anonymous assignments preserved if user logs in

### Database Optimization
- Compound indexes for efficient queries
- Unique constraints prevent duplicate assignments
- Timestamps indexed for time-based analytics

### Flexibility
- Middleware can be applied globally or per-route
- Support for multiple simultaneous tests
- Arbitrary number of variations per test
- Extensible event tracking with custom metadata

## Usage Examples

### Example 1: Simple A/B Test in React Component

```typescript
import { useABTest } from "@/lib/clientABTest";

function HomePage() {
  const { variation, loading, logEvent } = useABTest("homepage_layout");

  if (loading) return <div>Loading...</div>;

  const handleFollowClick = (clubId: string) => {
    logEvent("click_follow_button", { clubId });
    // ... follow logic
  };

  if (variation === "A") {
    return <LayoutA onFollowClick={handleFollowClick} />;
  } else {
    return <LayoutB onFollowClick={handleFollowClick} />;
  }
}
```

### Example 2: Using Middleware in API Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { applyABTestMiddleware } from "@/lib/abTestMiddleware";

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: "..." });
  
  // Automatically assign variations
  await applyABTestMiddleware(request, response, ["homepage_layout"]);
  
  return response;
}
```

### Example 3: Manual Event Logging

```typescript
import { logABTestEvent } from "@/lib/clientABTest";

async function handleButtonClick() {
  await logABTestEvent("cta_button_color", "click", { 
    buttonLocation: "header",
    timestamp: Date.now() 
  });
  // ... button click logic
}
```

### Example 4: Viewing Analytics

```bash
# Get analytics for specific test
curl http://localhost:3000/api/abtest/analytics?testName=homepage_layout

# Get analytics for all tests
curl http://localhost:3000/api/abtest/analytics
```

## How to Add a New A/B Test

1. **Add test to configuration**:
   ```json
   // ab-tests/tests.json
   {
     "activeTests": [
       {
         "name": "new_feature_test",
         "variations": ["control", "experimental"],
         "description": "Testing new feature adoption"
       }
     ]
   }
   ```

2. **Use in component**:
   ```typescript
   const { variation, logEvent } = useABTest("new_feature_test");
   
   if (variation === "control") {
     // Show current version
   } else {
     // Show experimental version
   }
   ```

3. **Log target events**:
   ```typescript
   logEvent("conversion", { featureUsed: true });
   ```

4. **Analyze results**:
   ```bash
   curl http://localhost:3000/api/abtest/analytics?testName=new_feature_test
   ```

## Testing the Infrastructure

### 1. Test Assignment Consistency
```bash
# Make multiple requests - should get same variation
curl -X POST http://localhost:3000/api/abtest/assign \
  -H "Content-Type: application/json" \
  -d '{"testName":"homepage_layout"}'
```

### 2. Test Event Logging
```bash
curl -X POST http://localhost:3000/api/abtest/event \
  -H "Content-Type: application/json" \
  -d '{
    "testName":"homepage_layout",
    "eventType":"click_follow_button",
    "eventData":{"clubId":"123"}
  }'
```

### 3. Test Analytics
```bash
curl http://localhost:3000/api/abtest/analytics
```

## Challenges Encountered

### Challenge 1: User Identification Across Sessions
**Problem**: Ensuring unauthenticated users receive consistent variations across browser sessions.

**Solution**: Implemented anonymous user ID system using secure HTTP-only cookies with 1-year expiry. User IDs are generated using cryptographically secure random bytes and stored persistently.

### Challenge 2: Database Performance
**Problem**: Analytics queries could become slow with large amounts of event data.

**Solution**: Created compound indexes on frequently queried fields (testName + variation + eventType) and used MongoDB aggregation pipeline for efficient data summarization.

### Challenge 3: Middleware Integration
**Problem**: Next.js App Router middleware has limitations on what code can run.

**Solution**: Created separate middleware utilities that can be applied at the API route level rather than globally, providing more flexibility while avoiding Next.js middleware constraints with database connections.

### Challenge 4: Type Safety
**Problem**: Ensuring type safety across TypeScript files while maintaining flexibility for event data.

**Solution**: Used TypeScript interfaces with `Record<string, any>` for flexible event data while maintaining strict typing for core fields. Mongoose schemas provide runtime validation.

## Future Enhancements

1. **Admin Dashboard**: Create UI for managing tests and viewing analytics
2. **Statistical Significance**: Add automatic calculation of confidence intervals
3. **Multi-Armed Bandit**: Implement dynamic traffic allocation based on performance
4. **Segment Analysis**: Support for analyzing results by user demographics
5. **Test Scheduling**: Automatic start/end dates for tests
6. **Variant Targeting**: Ability to target specific user segments with variations

## Files Added/Modified

### New Files Created:
- `ab-tests/tests.json` - Test configuration
- `src/lib/models/ABTest.ts` - Database models
- `src/lib/abTestUtils.ts` - Core utilities
- `src/lib/abTestMiddleware.ts` - Middleware functions
- `src/lib/clientABTest.ts` - Client-side utilities
- `src/app/api/abtest/assign/route.ts` - Assignment API
- `src/app/api/abtest/event/route.ts` - Event logging API
- `src/app/api/abtest/analytics/route.ts` - Analytics API
- `src/app/api/abtest/example/route.ts` - Example implementation

### Files Modified:
- None (infrastructure is additive and doesn't modify existing code)

## Dependencies Used
All required dependencies were already present in the project:
- `mongoose`: Database ORM
- `crypto`: For hashing and random ID generation
- `fs`: For reading configuration files
- `next`: Framework APIs
- `react`: For hooks

## Conclusion

The A/B testing infrastructure is now fully implemented and ready for use. It provides:
- ✅ Easy test configuration via JSON
- ✅ Consistent user assignment using hashing
- ✅ Automatic middleware-based assignment
- ✅ Comprehensive event logging
- ✅ Analytics API for measuring results
- ✅ React hooks for simple integration
- ✅ Support for authenticated and anonymous users
- ✅ Type-safe TypeScript implementation
- ✅ Optimized database queries

The infrastructure is production-ready and can be used immediately to start testing different variations of pages, components, and features.
