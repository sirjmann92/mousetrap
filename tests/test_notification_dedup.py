"""Test script for notification deduplication by UID.

This script simulates multiple sessions with the same UID triggering
count increment notifications to verify deduplication is working.

Usage:
    python test_notification_dedup.py

Example:
    python test_notification_dedup.py
"""

from datetime import UTC, datetime
import sys
import time

# Import the deduplication function and cache
sys.path.insert(0, "/app")
from backend.app import notification_dedup_cache, should_send_notification  # noqa: E402


def test_notification_deduplication() -> None:
    """Test notification deduplication across multiple sessions with same UID."""

    print("\n" + "=" * 70)
    print("Notification Deduplication Test (UID-based)")
    print("=" * 70)
    print(f"Time: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print()

    # Test scenario: Two sessions (Prowlarr and Gluetun) with same UID
    test_uid = "251349"  # Your actual UID
    test_username = "sirjmann92"

    print("📋 Test Scenario:")
    print(f"  - Same MAM Account: {test_username} (UID: {test_uid})")
    print("  - Two Sessions: Prowlarr and Gluetun")
    print("  - Event: Inactive Unsatisfied count increased from 0 to 7")
    print()

    # Clear any existing cache
    notification_dedup_cache.clear()
    print("🧹 Cleared deduplication cache")
    print()

    # Test 1: First session (Prowlarr) triggers notification
    print("Test 1: First session (Prowlarr) checks in")
    print("-" * 50)
    should_send_prowlarr = should_send_notification(test_uid, "inactive_unsatisfied", 0, 7)
    print(f"  Result: {'✅ SEND notification' if should_send_prowlarr else '❌ SKIP (duplicate)'}")
    print("  Expected: ✅ SEND (first occurrence)")
    if should_send_prowlarr:
        print(
            f"  Message: Account {test_username}: Inactive Unsatisfied (Pre-H&R) count increased by 7 (from 0 to 7)"
        )
    print()

    # Test 2: Second session (Gluetun) triggers same notification immediately
    print("Test 2: Second session (Gluetun) checks in (same change)")
    print("-" * 50)
    should_send_gluetun = should_send_notification(test_uid, "inactive_unsatisfied", 0, 7)
    print(f"  Result: {'✅ SEND notification' if should_send_gluetun else '❌ SKIP (duplicate)'}")
    print("  Expected: ❌ SKIP (duplicate within 60 min window)")
    if not should_send_gluetun:
        print("  ✓ Deduplication working! Second notification blocked.")
    print()

    # Test 3: Different count change should be allowed
    print("Test 3: New count change (7 to 41)")
    print("-" * 50)
    should_send_new = should_send_notification(test_uid, "inactive_unsatisfied", 7, 41)
    print(f"  Result: {'✅ SEND notification' if should_send_new else '❌ SKIP (duplicate)'}")
    print("  Expected: ✅ SEND (different count change)")
    if should_send_new:
        print(
            f"  Message: Account {test_username}: Inactive Unsatisfied (Pre-H&R) count increased by 34 (from 7 to 41)"
        )
    print()

    # Test 4: Same count change again (should be blocked)
    print("Test 4: Duplicate of Test 3 from another session")
    print("-" * 50)
    should_send_dup2 = should_send_notification(test_uid, "inactive_unsatisfied", 7, 41)
    print(f"  Result: {'✅ SEND notification' if should_send_dup2 else '❌ SKIP (duplicate)'}")
    print("  Expected: ❌ SKIP (duplicate within 60 min window)")
    print()

    # Show cache state
    print("📊 Cache State:")
    print("-" * 50)
    if test_uid in notification_dedup_cache:
        for event_type, changes in notification_dedup_cache[test_uid].items():
            print(f"  UID {test_uid} ({event_type}):")
            for change_key, timestamp in changes.items():
                age_seconds = time.time() - timestamp
                print(f"    - {change_key}: {age_seconds:.1f}s ago")
    print()

    # Summary
    print("=" * 70)
    print("Test Summary")
    print("=" * 70)
    test_results = {
        "Test 1 (First occurrence)": should_send_prowlarr is True,
        "Test 2 (Duplicate blocked)": should_send_gluetun is False,
        "Test 3 (New count change)": should_send_new is True,
        "Test 4 (Duplicate blocked)": should_send_dup2 is False,
    }

    all_passed = all(test_results.values())

    for test_name, passed in test_results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")

    print()
    if all_passed:
        print("🎉 All tests PASSED! Deduplication is working correctly.")
        print()
        print("Expected behavior:")
        print("  ✓ Only ONE notification per UID per count change")
        print("  ✓ Multiple sessions with same account don't spam")
        print("  ✓ Different count changes still trigger notifications")
        print("  ✓ Messages include username: 'Account {username}: ...'")
    else:
        print("⚠️  Some tests FAILED! Deduplication may not be working correctly.")

    print("=" * 70)
    print()


if __name__ == "__main__":
    try:
        test_notification_deduplication()
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
