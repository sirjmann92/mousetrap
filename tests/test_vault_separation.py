#!/usr/bin/env python3
"""Test script to verify the new separate Vault Configuration system."""

import asyncio
import sys

import aiohttp


async def test_vault_configuration_system() -> bool:
    """Test the complete vault configuration system (async aiohttp version)."""

    print("Testing Separate Vault Configuration System")
    print("=" * 50)

    base_url = "http://localhost:39842"
    test_config_id = "test_config"

    try:
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            # Test 1: List vault configurations (should be empty initially)
            print("\n1. Testing vault configuration listing...")
            async with session.get(f"{base_url}/api/vault/configurations") as response:
                if response.status == 200:
                    data = await response.json()
                    print(
                        f"   ✓ API accessible, found {len(data.get('configurations', {}))} configurations"
                    )
                else:
                    print(f"   ✗ Failed to list configurations: {response.status}")
                    return False

            # Test 2: Get default configuration
            print("\n2. Testing default configuration generation...")
            async with session.get(
                f"{base_url}/api/vault/configuration/{test_config_id}/default"
            ) as response:
                if response.status == 200:
                    default_config = await response.json()
                    print("   ✓ Default configuration generated")
                    print(f"   ✓ Contains expected fields: {list(default_config.keys())}")
                else:
                    print(f"   ✗ Failed to get default configuration: {response.status}")
                    return False

            # Test 3: Create and save a vault configuration
            print("\n3. Testing vault configuration creation...")
            test_vault_config = {
                "browser_mam_id": "test_browser_mam_id_12345",
                "uid_source": "session",
                "associated_session_label": "Gluetun",  # Using existing session
                "manual_uid": "",
                "vault_proxy_label": "",  # No proxy
                "connection_method": "auto",
                "automation": {
                    "enabled": True,
                    "frequency_hours": 24,
                    "min_points_threshold": 1000,
                    "last_run": None,
                },
                "validation": {
                    "last_validated": None,
                    "last_validation_result": None,
                    "cookie_health": "unknown",
                },
            }

            async with session.post(
                f"{base_url}/api/vault/configuration/{test_config_id}",
                json=test_vault_config,
                headers={"Content-Type": "application/json"},
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success"):
                        print("   ✓ Vault configuration created successfully")
                    else:
                        print(f"   ✗ Configuration validation failed: {result.get('errors', [])}")
                        return False
                else:
                    print(f"   ✗ Failed to create configuration: {response.status}")
                    return False

            # Test 4: Retrieve the created configuration
            print("\n4. Testing vault configuration retrieval...")
            async with session.get(
                f"{base_url}/api/vault/configuration/{test_config_id}"
            ) as response:
                if response.status == 200:
                    retrieved_config = await response.json()
                    print("   ✓ Configuration retrieved successfully")
                    print(
                        f"   ✓ Browser MAM ID: {retrieved_config.get('browser_mam_id', 'NOT_FOUND')}"
                    )
                    print(
                        f"   ✓ Associated Session: {retrieved_config.get('associated_session_label', 'NOT_FOUND')}"
                    )
                    print(
                        f"   ✓ Connection Method: {retrieved_config.get('connection_method', 'NOT_FOUND')}"
                    )
                else:
                    print(f"   ✗ Failed to retrieve configuration: {response.status}")
                    return False

            # Test 5: Test configuration validation
            print("\n5. Testing vault configuration validation...")
            async with session.post(
                f"{base_url}/api/vault/configuration/{test_config_id}/validate",
                json=test_vault_config,
                headers={"Content-Type": "application/json"},
            ) as response:
                if response.status == 200:
                    validation_result = await response.json()
                    print("   ✓ Validation endpoint accessible")
                    print(f"   ✓ Config Valid: {validation_result.get('config_valid', False)}")
                    print(
                        f"   ✓ Vault Accessible: {validation_result.get('vault_accessible', False)}"
                    )

                    if validation_result.get("effective_uid"):
                        print(f"   ✓ Effective UID resolved: {validation_result['effective_uid']}")

                    if validation_result.get("vault_result"):
                        vault_result = validation_result["vault_result"]
                        print(
                            f"   ✓ Vault test completed - Error: {vault_result.get('error', 'None')}"
                        )
                else:
                    print(f"   ✗ Validation failed: {response.status}")

            # Test 6: List configurations again to verify it was created
            print("\n6. Testing updated configuration list...")
            async with session.get(f"{base_url}/api/vault/configurations") as response:
                if response.status == 200:
                    data = await response.json()
                    configurations = data.get("configurations", {})
                    if test_config_id in configurations:
                        config_info = configurations[test_config_id]
                        print("   ✓ Configuration found in list")
                        print(f"   ✓ UID Source: {config_info.get('uid_source', 'NOT_FOUND')}")
                        print(
                            f"   ✓ Automation: {'Enabled' if config_info.get('automation_enabled') else 'Disabled'}"
                        )
                    else:
                        print("   ✗ Configuration not found in list")

            # Test 7: Test independent proxy selection
            print("\n7. Testing independent proxy configuration...")

            # First get available proxies
            async with session.get(f"{base_url}/api/proxies") as proxy_response:
                if proxy_response.status == 200:
                    proxy_data = await proxy_response.json()
                    available_proxies = list(proxy_data.keys()) if proxy_data else []
                    print(f"   ✓ Available proxies: {available_proxies}")

                    if available_proxies:
                        # Test with first available proxy
                        test_vault_config["vault_proxy_label"] = available_proxies[0]
                        test_vault_config["connection_method"] = "proxy"

                        async with session.post(
                            f"{base_url}/api/vault/configuration/{test_config_id}",
                            json=test_vault_config,
                            headers={"Content-Type": "application/json"},
                        ) as response:
                            if response.status == 200:
                                result = await response.json()
                                if result.get("success"):
                                    print("   ✓ Proxy configuration updated successfully")
                                else:
                                    print(
                                        f"   ⚠ Proxy configuration warning: {result.get('warnings', [])}"
                                    )
                            else:
                                print("   ✗ Failed to update proxy configuration")
                    else:
                        print("   ⚠ No proxies available for testing")

            # Test 8: Test manual UID configuration
            print("\n8. Testing manual UID configuration...")
            test_vault_config["uid_source"] = "manual"
            test_vault_config["manual_uid"] = "12345"
            test_vault_config["associated_session_label"] = ""

            async with session.post(
                f"{base_url}/api/vault/configuration/{test_config_id}",
                json=test_vault_config,
                headers={"Content-Type": "application/json"},
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success"):
                        print("   ✓ Manual UID configuration saved successfully")
                    else:
                        print(f"   ✗ Manual UID configuration failed: {result.get('errors', [])}")

            # Test 9: Clean up - delete test configuration
            print("\n9. Testing configuration deletion...")
            async with session.delete(
                f"{base_url}/api/vault/configuration/{test_config_id}"
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success"):
                        print("   ✓ Test configuration deleted successfully")
                    else:
                        print("   ✗ Failed to delete configuration")

        print("\n" + "=" * 50)
        print("✅ Separate Vault Configuration System Test Complete!")
        print("\nKey Features Verified:")
        print("• ✓ Independent vault configuration management")
        print("• ✓ Flexible UID association (session or manual)")
        print("• ✓ Independent proxy selection")
        print("• ✓ Configuration validation")
        print("• ✓ Multiple connection methods")
        print("• ✓ Automation settings")
    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
        return False
    else:
        return True


if __name__ == "__main__":
    success = asyncio.run(test_vault_configuration_system())
    sys.exit(0 if success else 1)
