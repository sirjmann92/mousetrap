"""Millionaire's Vault Automation System.

Handles automated vault donations based on user-configured schedules and thresholds
"""

import asyncio
from datetime import UTC, datetime
import logging
import time
from typing import Any

from backend.config import load_session
from backend.event_log import append_ui_event_log
from backend.mam_api import get_status
from backend.millionaires_vault_cookies import (
    perform_vault_donation,
    validate_browser_mam_id_with_config,
)
from backend.notifications_backend import notify_event
from backend.vault_config import (
    check_should_donate_to_pot,
    extract_mam_id_from_browser_cookies,
    get_effective_proxy_config,
    get_effective_uid,
    load_vault_config,
    save_vault_config,
    update_pot_tracking,
)

_logger: logging.Logger = logging.getLogger(__name__)


class VaultAutomationManager:
    """Manages automated vault donations for all configured vault instances."""

    def __init__(self) -> None:
        """Initialize the VaultAutomationManager with default state and check interval."""
        self.running = False
        self.check_interval = 300  # Check every 5 minutes for configs that need processing

    async def start(self) -> None:
        """Start the vault automation manager."""
        self.running = True
        _logger.info("[VaultAutomation] Vault automation manager started")

        while self.running:
            try:
                _logger.debug("[VaultAutomation] Running automation check cycle...")
                await self.process_all_configurations()
                _logger.debug(
                    "[VaultAutomation] Automation check completed, sleeping for %s seconds",
                    self.check_interval,
                )
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                _logger.error("[VaultAutomation] Error in automation loop: %s", e)
                await asyncio.sleep(60)  # Wait 1 minute before retrying

    def stop(self) -> None:
        """Stop the vault automation manager."""
        self.running = False
        _logger.info("[VaultAutomation] Vault automation manager stopped")

    async def process_all_configurations(self) -> None:
        """Process all vault configurations and run automation where needed."""
        try:
            _logger.debug("[VaultAutomation] Checking all vault configurations...")
            vault_config = load_vault_config()
            configurations = vault_config.get("vault_configurations", {})

            _logger.debug("[VaultAutomation] Found %s vault configurations", len(configurations))

            for config_id, config in configurations.items():
                _logger.debug(
                    "[VaultAutomation] Checking config '%s' for automation eligibility",
                    config_id,
                )
                if self._should_process_config(config):
                    _logger.info(
                        "[VaultAutomation] Config '%s' is eligible for automation",
                        config_id,
                    )
                    await self._process_config_automation(config_id, config)
                else:
                    automation = config.get("automation", {})
                    enabled = automation.get("enabled", False)
                    last_run = automation.get("last_run")
                    frequency_hours = automation.get("frequency_hours", 24)
                    next_run_time = last_run + (frequency_hours * 3600) if last_run else "never run"
                    current_time = time.time()

                    _logger.debug(
                        "[VaultAutomation] Config '%s' not eligible - enabled: %s, last_run: %s, frequency_hours: %s, next_run_time: %s, current_time: %s",
                        config_id,
                        enabled,
                        last_run,
                        frequency_hours,
                        next_run_time,
                        current_time,
                    )

        except Exception as e:
            _logger.error("[VaultAutomation] Error processing configurations: %s", e)

    def _should_process_config(self, config: dict[str, Any]) -> bool:
        """Check if a configuration should be processed for automation."""
        automation = config.get("automation", {})

        # Check if automation is enabled
        if not automation.get("enabled", False):
            return False

        # Check last run time
        last_run = automation.get("last_run")
        if not last_run:
            return True  # Never run before

        frequency_hours = automation.get("frequency_hours", 24)
        next_run_time = last_run + (frequency_hours * 3600)  # Convert hours to seconds

        return time.time() >= next_run_time

    async def _process_config_automation(self, config_id: str, config: dict[str, Any]) -> None:
        """Process automation for a specific configuration."""
        automation = config.get("automation", {})

        try:
            _logger.info("[VaultAutomation] Processing automation for config '%s'", config_id)

            # Validate configuration and get effective values
            effective_uid = get_effective_uid(config)
            if not effective_uid:
                await self._log_automation_error(config_id, "No effective UID available", config)
                return

            browser_mam_id = config.get("browser_mam_id", "").strip()
            if not browser_mam_id:
                await self._log_automation_error(config_id, "Browser MAM ID not configured", config)
                return

            # Extract mam_id from browser cookies
            extracted_mam_id = await extract_mam_id_from_browser_cookies(browser_mam_id)
            if not extracted_mam_id:
                await self._log_automation_error(
                    config_id, "Could not extract mam_id from browser cookies", config
                )
                return

            # Get effective proxy configuration
            effective_proxy = get_effective_proxy_config(config)
            connection_method = config.get("connection_method", "direct")

            # Test vault access first
            _logger.debug("[VaultAutomation] Validating vault access for config '%s'", config_id)
            vault_result = await validate_browser_mam_id_with_config(
                browser_mam_id=extracted_mam_id,
                uid=effective_uid,
                proxy_cfg=effective_proxy,
                connection_method=connection_method,
            )

            if not vault_result.get("valid"):
                await self._log_automation_error(
                    config_id,
                    "Vault access validation failed - cookies may be expired",
                    config,
                    vault_result.get("error", "Unknown validation error"),
                )
                return

            # Check current points using session-based approach (same as vault points API)
            session_label = config.get("associated_session_label", "").strip()
            if not session_label:
                await self._log_automation_error(
                    config_id, "No associated session configured", config
                )
                return

            # Load session configuration to get current mam_id

            try:
                session_config = load_session(session_label)
            except Exception as e:
                await self._log_automation_error(
                    config_id, f"Failed to load session '{session_label}': {e}", config
                )
                return

            # Get mam_id from session
            session_mam_id = session_config.get("mam", {}).get("mam_id", "").strip()
            if not session_mam_id:
                await self._log_automation_error(
                    config_id, f"Session '{session_label}' has no mam_id configured", config
                )
                return

            # Use the existing get_status function to fetch points (same as vault points API)

            _logger.debug(
                "[VaultAutomation] Fetching points for config '%s' via session '%s' with mam_id: [REDACTED]",
                config_id,
                session_label,
            )
            status_result = await get_status(mam_id=session_mam_id, proxy_cfg=effective_proxy)

            current_points = status_result.get("points")
            if current_points is None:
                error_msg = status_result.get("message", "Unable to fetch points")
                _logger.warning(
                    "[VaultAutomation] Cannot get current points for config '%s': %s - skipping this run",
                    config_id,
                    error_msg,
                )
                await self._update_last_run(config_id, config)
                return

            # current_points is already set from status_result.get('points')
            min_threshold = automation.get("min_points_threshold", 2000)

            _logger.info(
                "[VaultAutomation] Config '%s' has %s points (threshold: %s)",
                config_id,
                current_points,
                min_threshold,
            )

            if current_points < min_threshold:
                _logger.info(
                    "[VaultAutomation] Config '%s' has %s points, below threshold %s - no donation",
                    config_id,
                    current_points,
                    min_threshold,
                )
                await self._update_last_run(config_id, config)
                return

            # Check if we should donate to this pot cycle (if enabled)
            pot_check = await check_should_donate_to_pot(config)
            if not pot_check.get("should_donate", True):
                reason = pot_check.get("reason", "Unknown reason")
                _logger.info(
                    "[VaultAutomation] Config '%s' skipping donation: %s", config_id, reason
                )
                await self._update_last_run(config_id, config)
                return
            pot_reason = pot_check.get("reason", "Pot check passed")
            _logger.debug("[VaultAutomation] Config '%s' pot check: %s", config_id, pot_reason)

            # Calculate donation amount
            donation_amount = automation.get("donation_amount", 100)

            # Perform the donation
            _logger.info(
                "[VaultAutomation] Making automated donation of %s points for config '%s'",
                donation_amount,
                config_id,
            )
            success = await self._perform_automated_donation(
                config_id,
                config,
                donation_amount,
                extracted_mam_id,
                effective_uid,
                effective_proxy,
                connection_method,
            )

            if success:
                # Update pot tracking if once_per_pot is enabled
                current_pot_id = pot_check.get("current_pot_id")
                if current_pot_id and config.get("automation", {}).get("once_per_pot", False):
                    pot_update_success = update_pot_tracking(config_id, current_pot_id)
                    if pot_update_success:
                        _logger.info(
                            "[VaultAutomation] Updated pot tracking for config '%s': pot %s",
                            config_id,
                            current_pot_id,
                        )
                    else:
                        _logger.warning(
                            "[VaultAutomation] Failed to update pot tracking for config '%s'",
                            config_id,
                        )

                append_ui_event_log(
                    {
                        "timestamp": datetime.now(UTC).isoformat(),
                        "event_type": "vault_automation_success",
                        "label": "Global",
                        "config_id": config_id,
                        "amount": donation_amount,
                        "uid": effective_uid,
                        "current_points": current_points,
                        "threshold": min_threshold,
                        "status_message": f"Automated vault donation: {donation_amount} points donated for '{config_id}'",
                        "message": f"Automated vault donation successful: {donation_amount} points",
                    }
                )

                # Send success notification
                await notify_event(
                    event_type="vault_donation_success",
                    label=config_id,
                    status="success",
                    message=f"Successfully donated {donation_amount} points to the vault. "
                    f"Account had {current_points} points (threshold: {min_threshold}).",
                )

            # Update last run time regardless of success/failure
            await self._update_last_run(config_id, config)

        except Exception as e:
            _logger.error("[VaultAutomation] Error processing config '%s': %s", config_id, e)
            await self._log_automation_error(
                config_id, f"Automation processing error: {e!s}", config
            )

    async def _perform_automated_donation(
        self,
        config_id: str,
        config: dict[str, Any],
        amount: int,
        browser_mam_id: str,
        uid: str,
        proxy_cfg: dict[str, Any] | None,
        connection_method: str,
    ) -> bool:
        """Perform the actual automated donation using unified verification system."""
        try:
            _logger.debug(
                "[VaultAutomation] Making actual donation of %s points for config '%s'",
                amount,
                config_id,
            )

            # Get associated session mam_id for verification
            session_mam_id = None
            if config.get("associated_session_label"):
                try:
                    session_config = load_session(config["associated_session_label"])
                    session_mam_id = session_config.get("mam", {}).get("mam_id")
                    _logger.debug(
                        "[VaultAutomation] Using session '%s' for verification with mam_id: [REDACTED]",
                        config["associated_session_label"],
                    )
                except Exception as e:
                    _logger.warning(
                        "[VaultAutomation] Could not load associated session for verification: %s",
                        e,
                    )

            # Use the unified donation function that handles before/after verification internally
            result = await perform_vault_donation(
                browser_mam_id=browser_mam_id,
                uid=uid,
                amount=amount,
                proxy_cfg=proxy_cfg,
                connection_method=connection_method,
                verification_mam_id=session_mam_id,  # Pass session mam_id for unified verification
            )

            if result.get("success"):
                points_before = result.get("points_before")
                points_after = result.get("points_after")
                verification_method = result.get("verification_method", "unknown")

                _logger.info(
                    "[VaultAutomation] Donation successful for config '%s': %s points donated",
                    config_id,
                    amount,
                )
                _logger.debug(
                    "[VaultAutomation] Verification: %s - Before: %s, After: %s",
                    verification_method,
                    points_before,
                    points_after,
                )
                return True
            error_msg = result.get("error", "Unknown error")
            _logger.error(
                "[VaultAutomation] Donation failed for config '%s': %s", config_id, error_msg
            )

        except Exception as e:
            _logger.error("[VaultAutomation] Donation failed for config '%s': %s", config_id, e)
            return False
        else:
            return False

    async def _log_automation_error(
        self,
        config_id: str,
        error_message: str,
        config: dict[str, Any],
        detailed_error: str | None = None,
    ) -> None:
        """Log automation errors to both system logs and event log."""

        full_error = f"{error_message}"
        if detailed_error:
            full_error += f" - {detailed_error}"

        _logger.error("[VaultAutomation] Config '%s': %s", config_id, full_error)

        # Log to event log
        append_ui_event_log(
            {
                "timestamp": datetime.now(UTC).isoformat(),
                "event_type": "vault_automation_error",
                "label": "Global",
                "config_id": config_id,
                "error": error_message,
                "details": detailed_error,
                "status": "failed",
                "status_message": f"Vault automation error for '{config_id}': {error_message}",
            }
        )

        # Send error notification
        await notify_event(
            event_type="vault_automation_error",
            label=config_id,
            status="error",
            message=f"Vault automation failed: {full_error}. "
            f"Please check your configuration and browser cookies.",
        )

        # Update last run to prevent spam
        await self._update_last_run(config_id, config)

    async def _update_last_run(self, config_id: str, config: dict[str, Any]) -> None:
        """Update the last run timestamp for a configuration."""
        try:
            vault_config = load_vault_config()
            if config_id in vault_config.get("vault_configurations", {}):
                vault_config["vault_configurations"][config_id]["automation"]["last_run"] = (
                    time.time()
                )
                save_vault_config(vault_config)
        except Exception as e:
            _logger.error(
                "[VaultAutomation] Error updating last run for config '%s': %s", config_id, e
            )


# Global instance
_vault_automation_manager: VaultAutomationManager | None = None


def get_vault_automation_manager() -> VaultAutomationManager:
    """Get the global vault automation manager instance."""
    global _vault_automation_manager  # noqa: PLW0603
    if _vault_automation_manager is None:
        _vault_automation_manager = VaultAutomationManager()
    return _vault_automation_manager


async def start_vault_automation() -> None:
    """Start vault automation in the background."""
    manager = get_vault_automation_manager()
    await manager.start()


def stop_vault_automation() -> None:
    """Stop vault automation."""
    global _vault_automation_manager
    if _vault_automation_manager:
        _vault_automation_manager.stop()


# Legacy main function for compatibility
def main() -> None:
    """Legacy main function - now uses async automation manager."""

    try:
        asyncio.run(start_vault_automation())
    except KeyboardInterrupt:
        _logger.info("[VaultAutomation] Vault automation stopped by user")
    except Exception as e:
        _logger.error("[VaultAutomation] Vault automation crashed: %s", e)


if __name__ == "__main__":
    main()
