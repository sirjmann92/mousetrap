#!/usr/bin/env python3
"""Test script for MAM session expiry notifications.

This script triggers a test MAM expiry notification to validate the
notification system is working correctly.

Usage:
    python test_expiry_notification.py [session_label] [base_url]

Examples:
    python test_expiry_notification.py DirectSession
    python test_expiry_notification.py DirectSession http://localhost:39842
"""

import sys

import requests


def test_mam_expiry_notification(
    session_label: str | None = None,  # noqa: PT028
    base_url: str = "http://localhost:39842",  # noqa: PT028
) -> None:
    """Test MAM session expiry notification system."""

    print("=" * 70)
    print("MAM Session Expiry Notification Test")
    print("=" * 70)
    print(f"\nBase URL: {base_url}")

    # Get list of sessions
    print("\n📋 Fetching sessions...")
    try:
        response = requests.get(f"{base_url}/api/sessions", timeout=5)
        response.raise_for_status()
        sessions_data = response.json()
        sessions = sessions_data.get("sessions", [])

        if not sessions:
            print("❌ No sessions found!")
            return

        print(f"✅ Found {len(sessions)} session(s): {', '.join(sessions)}")

    except Exception as e:
        print(f"❌ Error fetching sessions: {e}")
        return

    # Determine which session to test
    if session_label:
        if session_label not in sessions:
            print(f"❌ Session '{session_label}' not found!")
            print(f"Available sessions: {', '.join(sessions)}")
            return
        test_session = session_label
    else:
        # Find first session with Prowlarr enabled
        test_session = None
        for sess in sessions:
            try:
                response = requests.get(f"{base_url}/api/session/{sess}", timeout=5)
                response.raise_for_status()
                session_data = response.json()
                if session_data.get("prowlarr", {}).get("enabled"):
                    test_session = sess
                    break
            except Exception:
                continue

        if not test_session:
            print("❌ No sessions with Prowlarr enabled found!")
            print(f"Available sessions: {', '.join(sessions)}")
            return

    print(f"\n🎯 Testing with session: {test_session}")

    # Get session details
    try:
        response = requests.get(f"{base_url}/api/session/{test_session}", timeout=5)
        response.raise_for_status()
        session_data = response.json()

        prowlarr = session_data.get("prowlarr", {})
        mam_created = session_data.get("mam_session_created_date")

        print("\n🔧 Session Configuration:")
        print(f"   MAM ID: {session_data.get('mam', {}).get('mam_id', 'N/A')}")
        print(f"   Prowlarr: {prowlarr.get('host', 'N/A')}:{prowlarr.get('port', 9696)}")
        print(f"   Prowlarr Enabled: {prowlarr.get('enabled', False)}")
        print(f"   MAM Session Created: {mam_created or 'Not set'}")
        print(f"   Notify Before Expiry: {prowlarr.get('notify_before_expiry_days', 7)} days")

        if not prowlarr.get("enabled"):
            print("\n❌ Prowlarr not enabled for this session!")
            return

    except Exception as e:
        print(f"❌ Error fetching session details: {e}")
        return

    # Send test notification
    print("\n🚀 Sending test expiry notification...")
    print("-" * 70)

    try:
        response = requests.post(
            f"{base_url}/api/prowlarr/test_expiry_notification",
            json={"label": test_session},
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()

        if result.get("success"):
            print("✅ Test notification sent successfully!")
            print("\n📧 Notification Details:")
            details = result.get("details", {})
            print(f"   Created: {details.get('created', 'N/A')}")
            print(f"   Expires: {details.get('expires', 'N/A')}")
            print(f"   Days Remaining: {details.get('days_remaining', 'N/A')}")

            print("\n" + "=" * 70)
            print("� Check Your Notification Channels")
            print("=" * 70)
            print("\nThe test notification has been sent via:")
            print("  • Email (if SMTP configured)")
            print("  • Webhook (if webhook configured)")
            print("  • Apprise (if Apprise configured)")
            print("\nMake sure 'mam_session_expiry' is enabled in:")
            print("  /config/notify.yaml → event_rules → mam_session_expiry")
            print("\nExpected notification format:")
            print("  Subject: [MouseTrap] mam_session_expiry - WARNING")
            print("  Content: Session expiry details with days remaining")

        else:
            print(f"❌ Failed to send notification: {result.get('message')}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    session_label = sys.argv[1] if len(sys.argv) > 1 else None
    base_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:39842"
    test_mam_expiry_notification(session_label, base_url)
