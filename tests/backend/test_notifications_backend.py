"""Backend tests for notification event-rule dispatch."""

from pathlib import Path
from typing import Any

import pytest
import yaml

from backend import notifications_backend

# The channels notify_event dispatches on, in the order it tries them.
CHANNELS = ("webhook", "email", "apprise", "pushover")

# Stand-in for every credential the channel configuration needs. Referencing a
# name rather than repeating a literal keeps flake8-bandit quiet without a noqa.
PLACEHOLDER = "placeholder"

# Enough configuration for all four channels, so that a rule enabling any one of
# them reaches its sender. Without this a silent dispatch would be ambiguous
# between the rule stopping it and the channel being unconfigured.
CHANNEL_CONFIG: dict[str, Any] = {
    "webhook_url": "https://webhook.invalid/hook",
    "smtp": {
        "host": "smtp.invalid",
        "port": 587,
        "username": "sender@invalid",
        "password": PLACEHOLDER,
        "to_email": "recipient@invalid",
    },
    "apprise": {
        "url": "https://apprise.invalid",
        "notify_url_string": "json://localhost",
    },
    "pushover": {"user_key": PLACEHOLDER, "api_token": PLACEHOLDER},
}


@pytest.fixture
def notify_config(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Point notification configuration at an isolated file.

    Args:
        tmp_path: Directory holding the notification configuration.
        monkeypatch: Fixture used to redirect the module-level path.

    Returns:
        The path the module now loads its configuration from.

    """
    path = tmp_path / "notify.yaml"
    monkeypatch.setattr(notifications_backend, "NOTIFY_CONFIG_PATH", path)
    return path


@pytest.fixture
def dispatched(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    """Replace every channel sender with a stub that records the channel.

    Args:
        monkeypatch: Fixture used to replace the four senders.

    Returns:
        The channels reached, appended in dispatch order.

    """
    sent: list[str] = []

    async def webhook(*_args: Any, **_kwargs: Any) -> bool:
        """Record a webhook dispatch and report success."""
        sent.append("webhook")
        return True

    def smtp(*_args: Any, **_kwargs: Any) -> bool:
        """Record an SMTP dispatch and report success."""
        sent.append("email")
        return True

    async def apprise(*_args: Any, **_kwargs: Any) -> bool:
        """Record an Apprise dispatch and report success."""
        sent.append("apprise")
        return True

    async def pushover(*_args: Any, **_kwargs: Any) -> bool:
        """Record a Pushover dispatch and report success."""
        sent.append("pushover")
        return True

    monkeypatch.setattr(notifications_backend, "send_webhook_notification", webhook)
    monkeypatch.setattr(notifications_backend, "send_smtp_notification", smtp)
    monkeypatch.setattr(notifications_backend, "send_apprise_notification", apprise)
    monkeypatch.setattr(notifications_backend, "send_pushover_notification", pushover)
    return sent


def _write_notify_config(path: Path, event_rules: dict[str, Any]) -> None:
    """Persist the fully configured channels alongside the given event rules.

    Args:
        path: Destination for the notification configuration.
        event_rules: Mapping from event type to its per-channel rule.

    """
    config = CHANNEL_CONFIG | {"event_rules": event_rules}
    path.write_text(yaml.safe_dump(config), encoding="utf-8")


@pytest.mark.parametrize("channel", CHANNELS)
async def test_single_channel_rule_dispatches_only_that_channel(
    notify_config: Path, dispatched: list[str], channel: str
) -> None:
    """Reach exactly the one channel a rule enables, for each of the four."""
    _write_notify_config(notify_config, {"automation_failure": {channel: True}})

    await notifications_backend.notify_event("automation_failure", message="check")

    assert dispatched == [channel]


async def test_event_type_without_a_rule_dispatches_nothing(
    notify_config: Path, dispatched: list[str]
) -> None:
    """Stay silent on every channel for an event type no rule covers."""
    _write_notify_config(notify_config, {"automation_success": dict.fromkeys(CHANNELS, True)})

    await notifications_backend.notify_event("automation_failure", message="check")

    assert dispatched == []
