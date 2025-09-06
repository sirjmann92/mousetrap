"""
Millionaire's Vault Automation System
Handles automated vault donations based on user-configured schedules and thresholds
"""

import time
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

from backend.vault_config import (
    load_vault_config, 
    save_vault_config, 
    get_effective_uid, 
    get_effective_proxy_config,
    extract_mam_id_from_browser_cookies
)
from backend.millionaires_vault_cookies import validate_browser_mam_id_with_config, perform_vault_donation
from backend.event_log import append_ui_event_log
from backend.notifications_backend import notify_event


class VaultAutomationManager:
    """Manages automated vault donations for all configured vault instances"""
    
    def __init__(self):
        self.running = False
        self.check_interval = 300  # Check every 5 minutes for configs that need processing
        
    async def start(self):
        """Start the vault automation manager"""
        self.running = True
        logging.info("[VaultAutomation] Vault automation manager started")
        
        while self.running:
            try:
                await self.process_all_configurations()
                await asyncio.sleep(self.check_interval)
            except Exception as e:
                logging.error(f"[VaultAutomation] Error in automation loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying
    
    def stop(self):
        """Stop the vault automation manager"""
        self.running = False
        logging.info("[VaultAutomation] Vault automation manager stopped")
    
    async def process_all_configurations(self):
        """Process all vault configurations and run automation where needed"""
        try:
            vault_config = load_vault_config()
            configurations = vault_config.get("vault_configurations", {})
            
            for config_id, config in configurations.items():
                if self._should_process_config(config):
                    await self._process_config_automation(config_id, config)
                    
        except Exception as e:
            logging.error(f"[VaultAutomation] Error processing configurations: {e}")
    
    def _should_process_config(self, config: Dict[str, Any]) -> bool:
        """Check if a configuration should be processed for automation"""
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
    
    async def _process_config_automation(self, config_id: str, config: Dict[str, Any]):
        """Process automation for a specific configuration"""
        automation = config.get("automation", {})
        
        try:
            logging.info(f"[VaultAutomation] Processing automation for config '{config_id}'")
            
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
            extracted_mam_id = extract_mam_id_from_browser_cookies(browser_mam_id)
            if not extracted_mam_id:
                await self._log_automation_error(config_id, "Could not extract mam_id from browser cookies", config)
                return
            
            # Get effective proxy configuration
            effective_proxy = get_effective_proxy_config(config)
            connection_method = config.get("connection_method", "direct")
            
            # Test vault access first
            vault_result = validate_browser_mam_id_with_config(
                browser_mam_id=extracted_mam_id,
                uid=effective_uid,
                proxy_cfg=effective_proxy,
                connection_method=connection_method
            )
            
            if not vault_result.get("valid"):
                await self._log_automation_error(
                    config_id, 
                    "Vault access validation failed - cookies may be expired", 
                    config,
                    vault_result.get("error", "Unknown validation error")
                )
                return
            
            # Check current points (this would need to be implemented in vault_result)
            # For now, we'll simulate point checking
            current_points = vault_result.get("current_points")  # TODO: Implement in validation
            min_threshold = automation.get("min_points_threshold", 2000)
            
            if current_points is None:
                logging.warning(f"[VaultAutomation] Cannot get current points for config '{config_id}' - skipping this run")
                await self._update_last_run(config_id, config)
                return
            
            if current_points < min_threshold:
                logging.info(f"[VaultAutomation] Config '{config_id}' has {current_points} points, below threshold {min_threshold} - no donation")
                await self._update_last_run(config_id, config)
                return
            
            # Calculate donation amount
            donation_amount = automation.get("donation_amount", 100)
            
            # Perform the donation
            success = await self._perform_automated_donation(
                config_id, config, donation_amount, extracted_mam_id, 
                effective_uid, effective_proxy, connection_method
            )
            
            if success:
                append_ui_event_log({
                    'timestamp': time.time(),
                    'event_type': 'vault_automation_success',
                    'config_id': config_id,
                    'amount': donation_amount,
                    'uid': effective_uid,
                    'current_points': current_points,
                    'threshold': min_threshold,
                    'message': f"Automated vault donation successful: {donation_amount} points"
                })
                
                # Send success notification
                notify_event(
                    event_type="vault_donation_success",
                    label=config_id,
                    status="success",
                    message=f"Successfully donated {donation_amount} points to the vault. "
                           f"Account had {current_points} points (threshold: {min_threshold})."
                )
            
            # Update last run time regardless of success/failure
            await self._update_last_run(config_id, config)
            
        except Exception as e:
            logging.error(f"[VaultAutomation] Error processing config '{config_id}': {e}")
            await self._log_automation_error(config_id, f"Automation processing error: {str(e)}", config)
    
    async def _perform_automated_donation(
        self, config_id: str, config: Dict[str, Any], amount: int,
        browser_mam_id: str, uid: str, proxy_cfg: Optional[Dict[str, Any]], 
        connection_method: str
    ) -> bool:
        """Perform the actual automated donation using unified verification system"""
        try:
            logging.info(f"[VaultAutomation] Making actual donation of {amount} points for config '{config_id}'")
            
            # Get associated session mam_id for verification
            session_mam_id = None
            if config.get("associated_session_label"):
                try:
                    from backend.config import load_session
                    session_config = load_session(config["associated_session_label"])
                    session_mam_id = session_config.get("mam", {}).get("mam_id")
                    logging.info(f"[VaultAutomation] Using session '{config['associated_session_label']}' for verification")
                except Exception as e:
                    logging.warning(f"[VaultAutomation] Could not load associated session for verification: {e}")
            
            # Use the unified donation function that handles before/after verification internally
            result = perform_vault_donation(
                browser_mam_id=browser_mam_id,
                uid=uid,
                amount=amount,
                proxy_cfg=proxy_cfg,
                connection_method=connection_method,
                verification_mam_id=session_mam_id  # Pass session mam_id for unified verification
            )
            
            if result.get("success"):
                points_before = result.get('points_before')
                points_after = result.get('points_after')
                verification_method = result.get('verification_method', 'unknown')
                
                logging.info(f"[VaultAutomation] Donation successful for config '{config_id}': {amount} points donated")
                logging.info(f"[VaultAutomation] Verification: {verification_method} - Before: {points_before}, After: {points_after}")
                return True
            else:
                error_msg = result.get("error", "Unknown error")
                logging.error(f"[VaultAutomation] Donation failed for config '{config_id}': {error_msg}")
                return False
            
        except Exception as e:
            logging.error(f"[VaultAutomation] Donation failed for config '{config_id}': {e}")
            return False
    
    async def _log_automation_error(
        self, config_id: str, error_message: str, config: Dict[str, Any], 
        detailed_error: Optional[str] = None
    ):
        """Log automation errors to both system logs and event log"""
        
        full_error = f"{error_message}"
        if detailed_error:
            full_error += f" - {detailed_error}"
        
        logging.error(f"[VaultAutomation] Config '{config_id}': {full_error}")
        
        # Log to event log
        append_ui_event_log({
            'timestamp': time.time(),
            'event_type': 'vault_automation_error',
            'config_id': config_id,
            'error': error_message,
            'details': detailed_error,
            'status': 'failed'
        })
        
        # Send error notification
        notify_event(
            event_type="vault_automation_error", 
            label=config_id,
            status="error",
            message=f"Vault automation failed: {full_error}. "
                   f"Please check your configuration and browser cookies."
        )
        
        # Update last run to prevent spam
        await self._update_last_run(config_id, config)
    
    async def _update_last_run(self, config_id: str, config: Dict[str, Any]):
        """Update the last run timestamp for a configuration"""
        try:
            vault_config = load_vault_config()
            if config_id in vault_config.get("vault_configurations", {}):
                vault_config["vault_configurations"][config_id]["automation"]["last_run"] = time.time()
                save_vault_config(vault_config)
        except Exception as e:
            logging.error(f"[VaultAutomation] Error updating last run for config '{config_id}': {e}")


# Global instance
_vault_automation_manager = None

def get_vault_automation_manager() -> VaultAutomationManager:
    """Get the global vault automation manager instance"""
    global _vault_automation_manager
    if _vault_automation_manager is None:
        _vault_automation_manager = VaultAutomationManager()
    return _vault_automation_manager

async def start_vault_automation():
    """Start vault automation in the background"""
    manager = get_vault_automation_manager()
    await manager.start()

def stop_vault_automation():
    """Stop vault automation"""
    global _vault_automation_manager
    if _vault_automation_manager:
        _vault_automation_manager.stop()

# Legacy main function for compatibility
def main():
    """Legacy main function - now uses async automation manager"""
    import asyncio
    try:
        asyncio.run(start_vault_automation())
    except KeyboardInterrupt:
        logging.info("[VaultAutomation] Vault automation stopped by user")
    except Exception as e:
        logging.error(f"[VaultAutomation] Vault automation crashed: {e}")

if __name__ == "__main__":
    main()
