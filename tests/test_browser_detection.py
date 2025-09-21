#!/usr/bin/env python3
"""Test script to verify browser cookie parsing and user agent selection."""

from pathlib import Path
import sys

from backend.millionaires_vault_cookies import get_browser_user_agent, parse_browser_cookies

sys.path.append(str(Path(__file__).parent.joinpath("backend")))


def test_browser_detection():
    """Test browser cookie parsing and user agent selection.

    This test parses sample cookie strings for different browsers, verifies that
    the parsed values for mam_id, uid, and browser match expected results, and
    checks that the generated user agent string contains the expected browser
    signature.
    """
    print("Testing browser cookie parsing and user agent selection...")

    # Test cases
    test_cases = [
        {
            "input": "mam_id=abc123; uid=456789; browser=firefox",
            "expected_browser": "firefox",
            "expected_mam_id": "abc123",
            "expected_uid": "456789",
        },
        {
            "input": "mam_id=def456; uid=789012; browser=chrome",
            "expected_browser": "chrome",
            "expected_mam_id": "def456",
            "expected_uid": "789012",
        },
        {
            "input": "mam_id=ghi789; uid=012345",  # No browser specified
            "expected_browser": "chrome",  # Should default to chrome
            "expected_mam_id": "ghi789",
            "expected_uid": "012345",
        },
        {
            "input": "mam_id=jkl012; uid=345678; browser=edge",
            "expected_browser": "edge",
            "expected_mam_id": "jkl012",
            "expected_uid": "345678",
        },
    ]

    for i, case in enumerate(test_cases):
        print(f"\nTest case {i + 1}: {case['input']}")

        # Parse cookies
        parsed = parse_browser_cookies(case["input"])

        # Check results
        assert parsed.get("mam_id") == case["expected_mam_id"], (
            f"mam_id mismatch: {parsed.get('mam_id')} != {case['expected_mam_id']}"
        )
        assert parsed.get("uid") == case["expected_uid"], (
            f"uid mismatch: {parsed.get('uid')} != {case['expected_uid']}"
        )
        assert parsed.get("browser", "chrome") == case["expected_browser"], (
            f"browser mismatch: {parsed.get('browser', 'chrome')} != {case['expected_browser']}"
        )

        # Test user agent generation
        user_agent = get_browser_user_agent(parsed.get("browser", "chrome"))
        print(f"  Browser: {parsed.get('browser', 'chrome')}")
        print(f"  User Agent: {user_agent[:50]}...")

        # Verify user agent contains expected browser signature
        browser_type = parsed.get("browser", "chrome")
        if browser_type == "firefox":
            assert "Firefox" in user_agent, "Firefox signature not found in user agent"
        elif browser_type == "chrome":
            assert "Chrome" in user_agent and "Edg" not in user_agent, (
                "Chrome signature not found in user agent"
            )
        elif browser_type == "edge":
            assert "Edg" in user_agent, "Edge signature not found in user agent"
        elif browser_type == "safari":
            assert "Safari" in user_agent and "Chrome" not in user_agent, (
                "Safari signature not found in user agent"
            )
        elif browser_type == "opera":
            assert "OPR" in user_agent, "Opera signature not found in user agent"

        print(f"  ✓ Test case {i + 1} passed")

    print("\n✅ All browser detection tests passed!")


if __name__ == "__main__":
    test_browser_detection()
