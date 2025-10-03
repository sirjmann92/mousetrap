"""Vault Configuration Management.

Handles independent vault configuration separate from session config
"""

import logging
from pathlib import Path
import re
import time
from typing import Any

import aiohttp
import yaml

from backend.config import _LOCK, list_sessions, load_session
from backend.proxy_config import load_proxies
from backend.utils import build_proxy_dict

_logger: logging.Logger = logging.getLogger(__name__)

POT_CYCLE_THRESHOLD = 20000000


def get_vault_config_path() -> Path:
    """Get path to vault configuration file.

    Use the same config path logic as the main config
    Check if we're in container (config mounted at /config) or development
    """
    if Path("/config").exists():
        return Path("/config") / "vault_config.yaml"
    # Development path
    return Path(__file__).parent.joinpath("..", "config", "vault_config.yaml")


def load_vault_config() -> dict[str, Any]:
    """Load vault configuration from file."""
    path = get_vault_config_path()

    if not path.exists():
        return {"vault_configurations": {}}

    try:
        with _LOCK, path.open("r", encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}
            if "vault_configurations" not in config:
                config["vault_configurations"] = {}
            return config
    except Exception as e:
        _logger.error("[VaultConfig] Error loading vault config: %s", e)
        return {"vault_configurations": {}}


def save_vault_config(config: dict[str, Any]) -> bool:
    """Save vault configuration to file."""
    path = get_vault_config_path()

    try:
        # Ensure directory exists
        path.parent.mkdir(parents=True, exist_ok=True)

        with _LOCK, path.open("w", encoding="utf-8") as f:
            yaml.safe_dump(config, f, default_flow_style=False, sort_keys=True)

        _logger.info("[VaultConfig] Saved vault configuration")
    except Exception as e:
        _logger.error("[VaultConfig] Error saving vault config: %s", e)
        return False
    else:
        return True


def get_vault_configuration(config_id: str) -> dict[str, Any] | None:
    """Get a specific vault configuration by ID."""
    config = load_vault_config()
    return config.get("vault_configurations", {}).get(config_id)


def save_vault_configuration(config_id: str, vault_config: dict[str, Any]) -> bool:
    """Save a specific vault configuration."""
    full_config = load_vault_config()
    full_config["vault_configurations"][config_id] = vault_config
    return save_vault_config(full_config)


def delete_vault_configuration(config_id: str) -> bool:
    """Delete a specific vault configuration."""
    full_config = load_vault_config()
    if config_id in full_config.get("vault_configurations", {}):
        del full_config["vault_configurations"][config_id]
        return save_vault_config(full_config)
    return False  # Return False if configuration doesn't exist


def list_vault_configurations() -> list[str]:
    """List all vault configuration IDs."""
    config = load_vault_config()
    return list(config.get("vault_configurations", {}).keys())


def get_default_vault_configuration() -> dict[str, Any]:
    """Get default vault configuration structure."""
    return {
        "browser_mam_id": "",
        "uid_source": "browser",  # "browser", "session", or "manual" - default to browser (session is optional)
        "associated_session_label": "",  # For uid_source="session" and for points display/notifications
        "manual_uid": "",  # For uid_source="manual"
        "vault_proxy_label": "",  # Independent proxy selection
        "connection_method": "direct",  # "direct" or "proxy" - default to "Direct (Browser Connection)"
        "automation": {
            "enabled": False,
            "frequency_hours": 24,
            "min_points_threshold": 2000,
            "once_per_pot": False,
            "last_run": None,
        },
        "pot_tracking": {"last_donation_pot": None, "last_donation_time": None},
        "validation": {
            "last_validated": None,
            "last_validation_result": None,
            "cookie_health": "unknown",
        },
    }


def validate_vault_configuration(vault_config: dict[str, Any]) -> dict[str, Any]:
    """Validate vault configuration and return validation result."""
    errors = []
    warnings = []

    # Check browser MAM ID
    if not vault_config.get("browser_mam_id", "").strip():
        errors.append("Browser MAM ID is required")

    # Check UID source - now supporting browser cookie extraction
    uid_source = vault_config.get("uid_source", "browser")  # Default to browser cookies

    if uid_source == "session":
        if not vault_config.get("associated_session_label", "").strip():
            errors.append("Associated session is required when using session UID")
        else:
            # Check if session exists

            available_sessions = list_sessions()
            if vault_config["associated_session_label"] not in available_sessions:
                errors.append(f"Session '{vault_config['associated_session_label']}' not found")
    elif uid_source == "manual":
        if not vault_config.get("manual_uid", "").strip():
            errors.append("Manual UID is required when using manual UID source")
    elif uid_source == "browser":
        # For browser cookies, we extract both mam_id and uid from browser_mam_id field
        # Validate that UID can be extracted from the cookie string
        browser_mam_id = vault_config.get("browser_mam_id", "").strip()
        if browser_mam_id:
            uid_match = re.search(r"uid=([^;]+)", browser_mam_id)
            if not uid_match:
                errors.append("Browser cookie string must contain 'uid=' value")
        # If browser_mam_id is empty, error already added above
    else:
        errors.append("Invalid UID source - must be 'session', 'manual', or 'browser'")

    # Check proxy configuration if connection method is proxy
    connection_method = vault_config.get("connection_method", "auto")
    if connection_method == "proxy":
        proxy_label = vault_config.get("vault_proxy_label", "").strip()
        if not proxy_label:
            errors.append("Vault proxy is required when connection method is 'proxy'")
        else:
            # Check if proxy exists
            try:
                available_proxies = load_proxies()
                if proxy_label not in available_proxies:
                    errors.append(f"Proxy '{proxy_label}' not found")
            except Exception:
                warnings.append("Could not validate proxy configuration")

    return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}


def get_effective_uid(vault_config: dict[str, Any]) -> str | None:
    """Get the effective UID for vault operations based on configuration."""
    uid_source = vault_config.get("uid_source", "browser")  # Default to browser cookies

    if uid_source == "manual":
        return vault_config.get("manual_uid", "").strip() or None
    if uid_source == "session":
        session_label = vault_config.get("associated_session_label", "").strip()
        if session_label:
            try:
                session_config = load_session(session_label)
                return session_config.get("last_status", {}).get("raw", {}).get("uid")
            except Exception as e:
                _logger.error(
                    "[VaultConfig] Error getting UID from session '%s': %s",
                    session_label,
                    e,
                )
                return None
    elif uid_source == "browser":
        # Parse UID from browser MAM ID cookie string
        browser_mam_id = vault_config.get("browser_mam_id", "").strip()
        if browser_mam_id:
            try:
                # Parse cookie string like "mam_id=...; uid=251349"
                uid_match = re.search(r"uid=([^;]+)", browser_mam_id)
                if uid_match:
                    return uid_match.group(1).strip()
                _logger.warning("[VaultConfig] No UID found in browser cookie string")
            except Exception as e:
                _logger.error("[VaultConfig] Error parsing UID from browser cookies: %s", e)
                return None

    return None


async def extract_mam_id_from_browser_cookies(browser_mam_id: str) -> str | None:
    """Extract the mam_id value from browser cookie string."""
    if not browser_mam_id:
        return None

    try:
        # Parse cookie string like "mam_id=VALUE; uid=251349" to extract just the VALUE part
        mam_id_match = re.search(r"mam_id=([^;]+)", browser_mam_id)
        if mam_id_match:
            mam_id_value = mam_id_match.group(1).strip()
            # Don't URL decode mam_id as it corrupts the cookie value and breaks MAM authentication
            _logger.debug("[VaultConfig] Extracted mam_id: [REDACTED]")
            return mam_id_value
        # If no mam_id= prefix, assume the whole string is the mam_id value
        _logger.warning(
            "[VaultConfig] No 'mam_id=' found in browser cookie string, using full string"
        )
        return browser_mam_id.strip()
    except Exception as e:
        _logger.error("[VaultConfig] Error extracting mam_id from browser cookies: %s", e)
        return None


def get_effective_proxy_config(vault_config: dict[str, Any]) -> dict[str, Any] | None:
    """Get the effective proxy configuration for vault operations."""
    # If connection method is direct, don't use any proxy regardless of vault_proxy_label
    connection_method = vault_config.get("connection_method", "direct")
    if connection_method == "direct":
        return None

    proxy_label = vault_config.get("vault_proxy_label", "").strip()

    if not proxy_label:
        return None

    try:
        available_proxies = load_proxies()

        if proxy_label in available_proxies:
            return available_proxies[proxy_label]
    except Exception as e:
        _logger.error("[VaultConfig] Error getting proxy config '%s': %s", proxy_label, e)

    return None


async def fetch_pot_donation_history(
    mam_id: str, uid: str, proxy_config: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Fetch pot donation history from pot.php page using existing vault authentication patterns."""
    try:
        # Build headers similar to existing vault calls
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Referer": "https://www.myanonamouse.net/millionaires.php",
        }

        cookies = {"mam_id": mam_id, "uid": uid}
        proxies = build_proxy_dict(proxy_config) if proxy_config else None

        # Map requests-style proxy dict to aiohttp proxy parameters
        proxy_url = None
        proxy_auth = None
        if proxies:
            proxy_url = proxies.get("https") if proxies.get("https") else proxies.get("http")
            username = proxy_config.get("username") if proxy_config else None
            password = proxy_config.get("password") if proxy_config else None
            if username and password:
                proxy_auth = aiohttp.BasicAuth(username, password)

        # Fetch pot.php page
        url = "https://www.myanonamouse.net/pot.php"
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            try:
                async with session.get(
                    url, headers=headers, cookies=cookies, proxy=proxy_url, proxy_auth=proxy_auth
                ) as response:
                    if response.status != 200:
                        return {"success": False, "error": f"HTTP {response.status}"}
                    content = await response.text()
            except Exception as e:
                _logger.error("[VaultConfig] Error fetching pot.php: %s", e)
                return {"success": False, "error": str(e)}

        # Parse current pot total and donation history from the page

        # Look for current pot total
        pot_match = re.search(
            r"Current\s+Pot.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)", content, re.IGNORECASE | re.DOTALL
        )
        current_pot = int(pot_match.group(1).replace(",", "")) if pot_match else 0

        # Look for user's recent donations in the page
        # This is a simplified approach - we'll track donations by monitoring changes
        user_donations: list = []

        return {
            "success": True,
            "current_pot_total": current_pot,
            "user_donations": user_donations,
            "pot_id": f"pot_{current_pot // POT_CYCLE_THRESHOLD}",  # Rough pot cycle identifier
        }

    except Exception as e:
        _logger.error("[VaultConfig] Error fetching pot donation history: %s", e)
        return {"success": False, "error": str(e)}


async def check_should_donate_to_pot(vault_config: dict[str, Any]) -> dict[str, Any]:
    """Check if we should donate to the current pot based on tracking data."""
    try:
        # Get pot tracking data
        pot_tracking = vault_config.get("pot_tracking", {})

        # If pot tracking is disabled, allow donation
        if not vault_config.get("automation", {}).get("once_per_pot", False):
            return {"should_donate": True, "reason": "Once per pot not enabled"}

        # Get effective authentication details
        extracted_mam_id = await extract_mam_id_from_browser_cookies(
            vault_config.get("browser_mam_id", "")
        )
        effective_uid = get_effective_uid(vault_config)
        effective_proxy = get_effective_proxy_config(vault_config)

        if not extracted_mam_id or not effective_uid:
            return {"should_donate": False, "reason": "Missing authentication details"}

        # Fetch current pot information
        pot_info = await fetch_pot_donation_history(
            extracted_mam_id, effective_uid, effective_proxy
        )

        if not pot_info.get("success"):
            # If we can't fetch pot info, err on the side of caution and allow donation
            _logger.warning(
                "[VaultConfig] Could not fetch pot info, allowing donation: %s",
                pot_info.get("error"),
            )
            return {"should_donate": True, "reason": "Could not verify pot status"}

        current_pot_id = pot_info.get("pot_id")
        last_donation_pot = pot_tracking.get("last_donation_pot")

        # If we haven't donated to this pot cycle yet, allow donation
        if current_pot_id != last_donation_pot:
            return {
                "should_donate": True,
                "reason": f"New pot cycle (current: {current_pot_id}, last: {last_donation_pot})",
                "current_pot_id": current_pot_id,
            }

    except Exception as e:
        _logger.error("[VaultConfig] Error checking pot donation status: %s", e)
        # On error, allow donation to avoid blocking legitimate donations
        return {"should_donate": True, "reason": f"Error checking status: {e}"}
    else:
        return {
            "should_donate": False,
            "reason": f"Already donated to pot {current_pot_id}",
            "current_pot_id": current_pot_id,
        }


def update_pot_tracking(vault_config_id: str, pot_id: str) -> bool:
    """Update pot tracking after a successful donation."""
    try:
        # Load current vault config
        full_config = load_vault_config()

        if vault_config_id not in full_config.get("vault_configurations", {}):
            return False

        vault_config = full_config["vault_configurations"][vault_config_id]

        # Update pot tracking
        if "pot_tracking" not in vault_config:
            vault_config["pot_tracking"] = {}

        vault_config["pot_tracking"]["last_donation_pot"] = pot_id
        vault_config["pot_tracking"]["last_donation_time"] = int(time.time())

        # Save configuration
        success = save_vault_config(full_config)

        if success:
            _logger.info(
                "[VaultConfig] Updated pot tracking for config '%s': donated to pot %s",
                vault_config_id,
                pot_id,
            )
    except Exception as e:
        _logger.error("[VaultConfig] Error updating pot tracking: %s", e)
        return False
    else:
        return success


def update_session_label_references(old_label: str, new_label: str) -> bool:
    """Update vault configurations that reference a renamed session.

    When a session is renamed, update all vault configurations that
    have associated_session_label pointing to the old label.

    Args:
        old_label: The old session label
        new_label: The new session label

    Returns:
        True if any configurations were updated, False otherwise
    """
    if not old_label or not new_label or old_label == new_label:
        return False

    try:
        full_config = load_vault_config()
        vault_configs = full_config.get("vault_configurations", {})

        updated = False
        for config_id, vault_config in vault_configs.items():
            if vault_config.get("associated_session_label") == old_label:
                vault_config["associated_session_label"] = new_label
                updated = True
                _logger.info(
                    "[VaultConfig] Updated vault config '%s': session label %s -> %s",
                    config_id,
                    old_label,
                    new_label,
                )

        if updated:
            return save_vault_config(full_config)

        return False  # noqa: TRY300
    except Exception as e:
        _logger.error("[VaultConfig] Error updating session label references: %s", e)
        return False
