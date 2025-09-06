# Test Suite

This directory contains integration tests for the Mousetrap application.

## Test Files

### `test_vault_separation.py`
Comprehensive integration test for the vault donation system:
- Tests vault configuration CRUD operations
- Validates session association
- Tests proxy configuration 
- Verifies manual UID handling
- Tests automation settings

### `test_vault_config.py` 
Legacy test for vault connection method configuration (largely superseded by separation test).

## Running Tests

From the project root:

```bash
# Run all vault tests
python3 tests/test_vault_separation.py

# Run specific test
python3 tests/test_vault_config.py
```

## Prerequisites

- Application must be running (`docker compose up -d`)
- At least one session configuration should exist (e.g., "Gluetun")

## Test Data

All tests use safe test data with no real credentials:
- Test mam_id: `test_browser_mam_id_12345`
- Test config ID: `test_config`
- All test configurations are cleaned up after execution
