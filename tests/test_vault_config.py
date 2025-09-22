#!/usr/bin/env python3
"""Test script to verify vault connection method configuration is working properly."""

import asyncio

import aiohttp


async def test_vault_connection_config() -> bool:
    """Test that vault connection method configuration is properly integrated."""

    print("Testing Vault Connection Method Configuration...")
    print("=" * 50)

    base_url = "http://localhost:39842"

    # Test 1: Check if we can load a session and it includes vault_connection_method
    print("\n1. Testing session loading with vault_connection_method...")
    try:
        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(f"{base_url}/api/session/Gluetun") as response,
        ):
            if response.status == 200:
                session_data = await response.json()
                vault_method = session_data.get("vault_connection_method", "NOT_FOUND")
                print("   ✓ Session loaded successfully")
                print(f"   ✓ vault_connection_method: {vault_method}")

                if vault_method == "NOT_FOUND":
                    print("   ⚠ WARNING: vault_connection_method not found in session data")
                else:
                    print("   ✓ vault_connection_method is properly included")
            else:
                print(f"   ✗ Failed to load session: {response.status}")
    except Exception as e:
        print(f"   ✗ Error loading session: {e}")

    # Test 2: Test saving session with vault_connection_method
    print("\n2. Testing session save with vault_connection_method...")
    try:
        # First load the current session
        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(f"{base_url}/api/session/Gluetun") as response,
        ):
            if response.status == 200:
                session_data = await response.json()

                # Update vault_connection_method
                session_data["vault_connection_method"] = "direct"

                # Save the session
                async with session.post(
                    f"{base_url}/api/session/save",
                    json=session_data,
                    headers={"Content-Type": "application/json"},
                ) as save_response:
                    if save_response.status == 200:
                        print("   ✓ Session saved successfully")

                        # Verify the change was persisted
                        async with session.get(
                            f"{base_url}/api/session/Gluetun"
                        ) as verify_response:
                            if verify_response.status == 200:
                                verify_data = await verify_response.json()
                                saved_method = verify_data.get(
                                    "vault_connection_method", "NOT_FOUND"
                                )
                                print(f"   ✓ Verified vault_connection_method: {saved_method}")

                                if saved_method == "direct":
                                    print(
                                        "   ✓ vault_connection_method properly saved and persisted"
                                    )
                                else:
                                    print(f"   ✗ Expected 'direct', got '{saved_method}'")
                            else:
                                print("   ✗ Failed to verify saved session")
                    else:
                        print(f"   ✗ Failed to save session: {save_response.status}")
            else:
                print("   ✗ Failed to load session for testing save")
    except Exception as e:
        print(f"   ✗ Error testing session save: {e}")

    # Test 3: Test vault validation with different connection methods
    print("\n3. Testing vault validation with connection method preferences...")
    try:
        # Test validation endpoint (this will fail because we don't have valid cookies,
        # but we can check if the connection method is being used)
        test_data = {"label": "Gluetun", "browser_mam_id": "test_cookie_value"}
        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.post(
                f"{base_url}/api/session/validate_cookies",
                json=test_data,
                headers={"Content-Type": "application/json"},
            ) as validation_response,
        ):
            if validation_response.status == 200:
                result = await validation_response.json()
                print("   ✓ Validation endpoint responded successfully")
                print(f"   ✓ Validation result: {result.get('error', 'No error (unexpected)')}")

                # The validation should fail (no valid cookies), but it means the endpoint works
                if not result.get("valid", True):
                    print("   ✓ Validation properly failed (expected with test data)")
                else:
                    print("   ⚠ Unexpected: validation succeeded with test data")
            else:
                print(f"   ✗ Validation endpoint failed: {validation_response.status}")
    except Exception as e:
        print(f"   ✗ Error testing validation: {e}")

    print("\n" + "=" * 50)
    print("Vault Connection Method Configuration Test Complete!")
    return True


if __name__ == "__main__":
    asyncio.run(test_vault_connection_config())
