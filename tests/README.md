# Test Suite

This directory contains integration tests for the Mousetrap application.

## Test Files

### `test_expiry_notification.py`
Tests notification system for MAM session expiry tracking:
- Validates expiry date calculations
- Tests notification triggers
- Verifies notification deduplication

### `test_notification_dedup.py`
Tests notification deduplication logic:
- Validates event-based deduplication
- Tests time-based expiry
- Verifies cache management

## Running Tests

From the project root:

```bash
# Run all tests
python3 -m pytest tests/

# Run specific test
python3 tests/test_expiry_notification.py
```

## Prerequisites

- Application must be running (`docker compose up -d`)
- At least one session configuration should exist (e.g., "Gluetun")

## Test Data

All tests use safe test data with no real credentials and are cleaned up after execution.
