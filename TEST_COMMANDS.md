# Test Execution Guide

Quick reference for running tests on the `logic` branch.

## Frontend Tests

From the `frontend/` directory:

```bash
# Run tests once
npm run test:run

# Run tests in watch mode (for development)
npm run test
```

**Expected Output:**
```
✓ src/utils/gameState.test.ts  (7 tests)
✓ src/utils/scoring.test.ts  (15 tests)

Test Files  2 passed (2)
Tests  22 passed (22)
```

## Backend Tests

From the `backend/` directory:

```bash
# Setup environment (one-time)
uv sync --all-extras

# Run all tests with verbose output
uv run pytest tests/test_api.py -v

# Run specific test
uv run pytest tests/test_api.py::test_submit_score_creates_entry_and_returns_response -v

# Run with short traceback format
uv run pytest tests/test_api.py -v --tb=short
```

**Expected Output:**
```
======================= 22 passed in 1.41s ========================
```

## CI/CD Integration

Both test suites should be integrated into GitHub Actions for continuous integration. The tests are designed to run quickly and in isolation using in-memory databases.

- **Frontend:** ~1 second
- **Backend:** ~1.4 seconds
- **Total:** ~2.4 seconds
