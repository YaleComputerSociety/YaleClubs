# A/B Testing Infrastructure - Testing Guide

## Overview
This guide shows you how to verify that the A/B testing infrastructure is working correctly.

## Quick Tests

### 1. Visual Demo Page
Visit the interactive demo page:
```
http://localhost:3000/abtest-demo
```

**What to test:**
- ✅ Page loads without errors
- ✅ Shows either "Version A" or "Version B"
- ✅ Refresh multiple times - should show the **same version** every time
- ✅ Click "Log Button Click" and "Log Conversion" buttons
- ✅ See events appear in the log

**Testing in multiple browsers/incognito:**
1. Open in Chrome - note which variation you get
2. Refresh multiple times - should stay the same
3. Open in Incognito/Private window - might get different variation (new anonymous user)
4. Refresh incognito multiple times - should stay consistent

### 2. Automated Test Script
Run the automated test suite:
```bash
./test-abtest.sh
```

**This tests:**
- ✅ Variation assignment
- ✅ Consistency (same user gets same variation)
- ✅ Event logging
- ✅ Multiple test assignments
- ✅ Analytics retrieval
- ✅ Error handling

## Manual API Tests

### Test 1: Get a Variation Assignment
```bash
curl -X POST http://localhost:3000/api/abtest/assign \
  -H "Content-Type: application/json" \
  -d '{"testName":"homepage_layout"}' \
  -c cookies.txt
```

**Expected output:**
```json
{
  "testName": "homepage_layout",
  "variation": "A",
  "userId": "anon_1234567890abcdef"
}
```

### Test 2: Verify Consistency
```bash
# Run this multiple times - should get same variation
for i in {1..5}; do
  curl -s -X POST http://localhost:3000/api/abtest/assign \
    -H "Content-Type: application/json" \
    -d '{"testName":"homepage_layout"}' \
    -b cookies.txt | grep variation
done
```

**Expected:** All 5 responses show the same variation

### Test 3: Log an Event
```bash
curl -X POST http://localhost:3000/api/abtest/event \
  -H "Content-Type: application/json" \
  -d '{
    "testName":"homepage_layout",
    "eventType":"button_click",
    "eventData":{"buttonId":"follow","clubId":"abc123"}
  }' \
  -b cookies.txt
```

**Expected output:**
```json
{"success": true}
```

### Test 4: View Analytics
```bash
# All tests
curl http://localhost:3000/api/abtest/analytics

# Specific test
curl http://localhost:3000/api/abtest/analytics?testName=homepage_layout
```

**Expected output:**
```json
{
  "testName": "homepage_layout",
  "assignments": [
    {"variation": "A", "count": 5},
    {"variation": "B", "count": 7}
  ],
  "events": [
    {"variation": "A", "eventType": "assignment", "count": 5},
    {"variation": "A", "eventType": "button_click", "count": 2},
    {"variation": "B", "eventType": "assignment", "count": 7},
    {"variation": "B", "eventType": "button_click", "count": 5}
  ]
}
```

## Database Verification

### Check MongoDB Collections
If you have MongoDB access, verify the data is being stored:

```javascript
// Check assignments
db.abtestassignments.find().pretty()

// Check events
db.abtestevents.find().pretty()

// Count assignments per variation
db.abtestassignments.aggregate([
  { $match: { testName: "homepage_layout" } },
  { $group: { _id: "$variation", count: { $sum: 1 } } }
])

// Count events by type and variation
db.abtestevents.aggregate([
  { $match: { testName: "homepage_layout" } },
  { $group: { 
      _id: { variation: "$variation", eventType: "$eventType" },
      count: { $sum: 1 }
  }}
])
```

## Integration Tests

### Test in Your Components

Create a test component to verify the React hook:

```typescript
// pages/test-hook.tsx
"use client";
import { useABTest } from "@/lib/clientABTest";

export default function TestHook() {
  const { variation, loading, logEvent } = useABTest("homepage_layout");

  console.log("Loading:", loading);
  console.log("Variation:", variation);

  return (
    <div>
      <p>Variation: {variation}</p>
      <button onClick={() => logEvent("test_click")}>
        Log Test Event
      </button>
    </div>
  );
}
```

## Load Testing

### Test Multiple Concurrent Users

```bash
# Create 100 different users and get their assignments
for i in {1..100}; do
  curl -s -X POST http://localhost:3000/api/abtest/assign \
    -H "Content-Type: application/json" \
    -d '{"testName":"homepage_layout"}' \
    -c "cookie_$i.txt" &
done
wait

# Check distribution
curl http://localhost:3000/api/abtest/analytics?testName=homepage_layout
```

**What to verify:**
- All requests succeed
- Users are distributed roughly 50/50 between variations (may vary due to hashing)
- No errors in server logs

## Common Issues and Solutions

### Issue: Getting different variations on refresh
**Cause:** Cookies not persisting
**Solution:** 
- Make sure cookies are enabled
- Check cookie settings in `.env` files
- Verify `ab_user_id` cookie is being set

### Issue: Event logging fails with "No variation assignment found"
**Cause:** User hasn't been assigned to the test yet
**Solution:** Call `/api/abtest/assign` first, then `/api/abtest/event`

### Issue: Analytics shows no data
**Cause:** MongoDB connection issue or no data logged yet
**Solution:**
- Check MongoDB connection in logs
- Verify MONGODB_URI in environment variables
- Run assignment/event tests first to generate data

### Issue: All users getting the same variation
**Cause:** Hashing function not working properly
**Solution:** Check that different `userId` values produce different variations

## Success Criteria

✅ **Assignment works correctly:**
- Users get assigned a variation
- Same user always gets same variation
- Different users get distributed across variations

✅ **Event logging works:**
- Events are stored in database
- Events are associated with correct variation
- Event data is preserved

✅ **Analytics works:**
- Can retrieve assignment counts
- Can retrieve event counts
- Data is grouped correctly by variation

✅ **Integration works:**
- React hook loads variation
- React hook logs events
- No errors in console

## Next Steps

Once all tests pass:

1. **Remove the demo page** (optional):
   ```bash
   rm -rf src/app/abtest-demo
   ```

2. **Implement your first real A/B test:**
   - Update `ab-tests/tests.json` with your test
   - Use `useABTest()` in your component
   - Log conversion events
   - Analyze results after 1-2 weeks

3. **Monitor in production:**
   - Check analytics daily
   - Look for statistical significance
   - Make data-driven decisions

## Useful Commands

```bash
# Quick health check
curl http://localhost:3000/api/abtest/analytics | python3 -m json.tool

# Clean up test cookies
rm -f *.txt

# Run full test suite
./test-abtest.sh

# Monitor server logs
npm run dev | grep -i "abtest"
```

## Questions?

Refer to `Milestones.md` for complete documentation of the A/B testing infrastructure.
