# A/B Testing Configuration

## Overview

This directory contains configuration files for A/B testing infrastructure.

## Configuration File: tests.json

The `tests.json` file defines all active A/B tests in the application.

### Structure

```json
{
  "activeTests": [
    {
      "name": "test_identifier",
      "variations": ["variation1", "variation2"],
      "description": "Description of what this test measures"
    }
  ]
}
```

### Fields

- **name** (required): Unique identifier for the test. Use snake_case naming convention.
- **variations** (required): Array of variation identifiers. Can have 2 or more variations.
- **description** (optional): Human-readable description of the test purpose.

### Current Active Tests

1. **homepage_layout**
   - Variations: A, B
   - Purpose: Testing different homepage layouts to see which leads to more club follows

2. **event_card_design**
   - Variations: compact, detailed
   - Purpose: Testing different event card designs to see which leads to more event clicks

3. **cta_button_color**
   - Variations: blue, green, red
   - Purpose: Testing different call-to-action button colors to see which leads to more conversions

## Adding a New Test

1. Open `tests.json`
2. Add a new test object to the `activeTests` array:

```json
{
  "name": "your_test_name",
  "variations": ["control", "experimental"],
  "description": "What you're testing and why"
}
```

3. Save the file
4. Implement the test in your code using the A/B testing utilities (see main documentation)

## Best Practices

- **Test Names**: Use descriptive, snake_case names (e.g., `checkout_button_position`)
- **Variations**: Keep names short and meaningful (e.g., `control`, `v2`, `blue`, `compact`)
- **Number of Variations**: Start with 2 variations (A/B test). Add more only if needed for multivariate testing.
- **Descriptions**: Clearly state what metric you're trying to improve
- **One Change at a Time**: Each test should change only one thing to isolate the effect

## Removing a Test

When a test is complete:

1. Analyze the results using `/api/abtest/analytics?testName=your_test_name`
2. Implement the winning variation in your code
3. Remove the test from `tests.json`
4. Keep the implementation of the winning variation

**Note**: Historical test data remains in the database for reference.

## Monitoring

View analytics for all active tests:

```bash
GET /api/abtest/analytics
```

View analytics for a specific test:

```bash
GET /api/abtest/analytics?testName=homepage_layout
```

## Questions?

Refer to the main documentation in `Milestones.md` for complete usage examples and API documentation.
