#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
COOKIE_FILE="test_cookies.txt"

echo "================================"
echo "A/B Testing Infrastructure Tests"
echo "================================"
echo ""

# Clean up old cookies
rm -f $COOKIE_FILE

# Test 1: Assignment Endpoint
echo -e "${YELLOW}Test 1: Testing variation assignment...${NC}"
RESPONSE1=$(curl -s -X POST "$BASE_URL/api/abtest/assign" \
  -H "Content-Type: application/json" \
  -d '{"testName":"homepage_layout"}' \
  -c $COOKIE_FILE)

VARIATION1=$(echo $RESPONSE1 | grep -o '"variation":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $RESPONSE1 | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$VARIATION1" ]; then
  echo -e "${GREEN}✓ Got variation: $VARIATION1${NC}"
  echo -e "${GREEN}✓ User ID: $USER_ID${NC}"
else
  echo -e "${RED}✗ Failed to get variation${NC}"
  echo "Response: $RESPONSE1"
  exit 1
fi
echo ""

# Test 2: Consistency Check
echo -e "${YELLOW}Test 2: Testing consistency (same user = same variation)...${NC}"
RESPONSE2=$(curl -s -X POST "$BASE_URL/api/abtest/assign" \
  -H "Content-Type: application/json" \
  -d '{"testName":"homepage_layout"}' \
  -b $COOKIE_FILE)

VARIATION2=$(echo $RESPONSE2 | grep -o '"variation":"[^"]*"' | cut -d'"' -f4)

if [ "$VARIATION1" == "$VARIATION2" ]; then
  echo -e "${GREEN}✓ Consistency check passed: $VARIATION1 == $VARIATION2${NC}"
else
  echo -e "${RED}✗ Consistency check failed: $VARIATION1 != $VARIATION2${NC}"
  exit 1
fi
echo ""

# Test 3: Event Logging
echo -e "${YELLOW}Test 3: Testing event logging...${NC}"
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/abtest/event" \
  -H "Content-Type: application/json" \
  -d '{
    "testName":"homepage_layout",
    "eventType":"test_click",
    "eventData":{"test":true}
  }' \
  -b $COOKIE_FILE)

if echo $EVENT_RESPONSE | grep -q "success"; then
  echo -e "${GREEN}✓ Event logged successfully${NC}"
else
  echo -e "${RED}✗ Failed to log event${NC}"
  echo "Response: $EVENT_RESPONSE"
  exit 1
fi
echo ""

# Test 4: Multiple Test Assignment
echo -e "${YELLOW}Test 4: Testing multiple test assignments...${NC}"
RESPONSE3=$(curl -s -X POST "$BASE_URL/api/abtest/assign" \
  -H "Content-Type: application/json" \
  -d '{"testName":"event_card_design"}' \
  -b $COOKIE_FILE)

VARIATION3=$(echo $RESPONSE3 | grep -o '"variation":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$VARIATION3" ]; then
  echo -e "${GREEN}✓ Got variation for event_card_design: $VARIATION3${NC}"
else
  echo -e "${RED}✗ Failed to get variation for second test${NC}"
  exit 1
fi
echo ""

# Test 5: Analytics Endpoint
echo -e "${YELLOW}Test 5: Testing analytics endpoint...${NC}"
ANALYTICS=$(curl -s "$BASE_URL/api/abtest/analytics?testName=homepage_layout")

if echo $ANALYTICS | grep -q "assignments"; then
  echo -e "${GREEN}✓ Analytics endpoint working${NC}"
  echo "Sample analytics data:"
  echo $ANALYTICS | python3 -m json.tool 2>/dev/null || echo $ANALYTICS
else
  echo -e "${RED}✗ Analytics endpoint failed${NC}"
  echo "Response: $ANALYTICS"
fi
echo ""

# Test 6: Invalid Test Name
echo -e "${YELLOW}Test 6: Testing error handling (invalid test)...${NC}"
ERROR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/abtest/assign" \
  -H "Content-Type: application/json" \
  -d '{"testName":"nonexistent_test"}')

if echo $ERROR_RESPONSE | grep -q "error"; then
  echo -e "${GREEN}✓ Error handling works correctly${NC}"
else
  echo -e "${RED}✗ Should have returned error for invalid test${NC}"
fi
echo ""

# Cleanup
rm -f $COOKIE_FILE

echo "================================"
echo -e "${GREEN}All tests completed!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000/abtest-demo to see the visual demo"
echo "2. Open browser console and run:"
echo "   fetch('/api/abtest/analytics').then(r => r.json()).then(console.log)"
echo ""
