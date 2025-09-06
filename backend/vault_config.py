"""
Vault Configuration Management
Handles independent vault configuration separate from session config
"""

import yaml
import os
import logging
from typing import Dict, Any, Optional, List
from backend.config import LOCK

def get_vault_config_path():
    """Get path to vault configuration file"""
    # Use the same config path logic as the main config
    # Check if we're in container (config mounted at /config) or development
    if os.path.exists("/config"):
        return "/config/vault_config.yaml"
    else:
        # Development path
        return os.path.join(os.path.dirname(__file__), "..", "config", "vault_config.yaml")

def load_vault_config() -> Dict[str, Any]:
    """Load vault configuration from file"""
    path = get_vault_config_path()
    
    if not os.path.exists(path):
        return {"vault_configurations": {}}
    
    try:
        with LOCK, open(path, "r") as f:
            config = yaml.safe_load(f) or {}
            if "vault_configurations" not in config:
                config["vault_configurations"] = {}
            return config
    except Exception as e:
        logging.error(f"[VaultConfig] Error loading vault config: {e}")
        return {"vault_configurations": {}}

def save_vault_config(config: Dict[str, Any]) -> bool:
    """Save vault configuration to file"""
    path = get_vault_config_path()
    
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        with LOCK, open(path, "w") as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=True)
        
        logging.info(f"[VaultConfig] Saved vault configuration")
        return True
    except Exception as e:
        logging.error(f"[VaultConfig] Error saving vault config: {e}")
        return False

def get_vault_configuration(config_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific vault configuration by ID"""
    config = load_vault_config()
    return config.get("vault_configurations", {}).get(config_id)

def save_vault_configuration(config_id: str, vault_config: Dict[str, Any]) -> bool:
    """Save a specific vault configuration"""
    full_config = load_vault_config()
    full_config["vault_configurations"][config_id] = vault_config
    return save_vault_config(full_config)

def delete_vault_configuration(config_id: str) -> bool:
    """Delete a specific vault configuration"""
    full_config = load_vault_config()
    if config_id in full_config.get("vault_configurations", {}):
        del full_config["vault_configurations"][config_id]
        return save_vault_config(full_config)
    return False  # Return False if configuration doesn't exist

def list_vault_configurations() -> List[str]:
    """List all vault configuration IDs"""
    config = load_vault_config()
    return list(config.get("vault_configurations", {}).keys())

def get_default_vault_configuration() -> Dict[str, Any]:
    """Get default vault configuration structure"""
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
            "last_run": None
        },
        "validation": {
            "last_validated": None,
            "last_validation_result": None,
            "cookie_health": "unknown"
        }
    }

def validate_vault_configuration(vault_config: Dict[str, Any]) -> Dict[str, Any]:
    """Validate vault configuration and return validation result"""
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
            from backend.config import list_sessions
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
            import re
            uid_match = re.search(r'uid=([^;]+)', browser_mam_id)
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
            from backend.proxy_config import load_proxies
            try:
                available_proxies = load_proxies()
                if proxy_label not in available_proxies:
                    errors.append(f"Proxy '{proxy_label}' not found")
            except Exception:
                warnings.append("Could not validate proxy configuration")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }

def get_effective_uid(vault_config: Dict[str, Any]) -> Optional[str]:
    """Get the effective UID for vault operations based on configuration"""
    uid_source = vault_config.get("uid_source", "browser")  # Default to browser cookies
    
    if uid_source == "manual":
        return vault_config.get("manual_uid", "").strip() or None
    elif uid_source == "session":
        session_label = vault_config.get("associated_session_label", "").strip()
        if session_label:
            try:
                from backend.config import load_session
                session_config = load_session(session_label)
                return session_config.get("last_status", {}).get("raw", {}).get("uid")
            except Exception as e:
                logging.error(f"[VaultConfig] Error getting UID from session '{session_label}': {e}")
                return None
    elif uid_source == "browser":
        # Parse UID from browser MAM ID cookie string
        browser_mam_id = vault_config.get("browser_mam_id", "").strip()
        if browser_mam_id:
            try:
                # Parse cookie string like "mam_id=...; uid=251349"
                import re
                uid_match = re.search(r'uid=([^;]+)', browser_mam_id)
                if uid_match:
                    return uid_match.group(1).strip()
                else:
                    logging.warning(f"[VaultConfig] No UID found in browser cookie string")
                    return None
            except Exception as e:
                logging.error(f"[VaultConfig] Error parsing UID from browser cookies: {e}")
                return None
    
    return None

def extract_mam_id_from_browser_cookies(browser_mam_id: str) -> Optional[str]:
    """Extract the mam_id value from browser cookie string"""
    if not browser_mam_id:
        return None
    
    try:
        import re
        import urllib.parse
        
        # Parse cookie string like "mam_id=VALUE; uid=251349" to extract just the VALUE part
        mam_id_match = re.search(r'mam_id=([^;]+)', browser_mam_id)
        if mam_id_match:
            mam_id_value = mam_id_match.group(1).strip()
            # URL decode the mam_id value in case it's encoded
            try:
                decoded_mam_id = urllib.parse.unquote(mam_id_value)
                logging.debug(f"[VaultConfig] Extracted and decoded mam_id: {mam_id_value} -> {decoded_mam_id}")
                return decoded_mam_id
            except Exception as decode_error:
                logging.warning(f"[VaultConfig] Failed to URL decode mam_id, using original: {decode_error}")
                return mam_id_value
        else:
            # If no mam_id= prefix, assume the whole string is the mam_id value
            logging.warning(f"[VaultConfig] No 'mam_id=' found in browser cookie string, using full string")
            return browser_mam_id.strip()
    except Exception as e:
        logging.error(f"[VaultConfig] Error extracting mam_id from browser cookies: {e}")
        return None

def get_effective_proxy_config(vault_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Get the effective proxy configuration for vault operations"""
    proxy_label = vault_config.get("vault_proxy_label", "").strip()
    
    if not proxy_label:
        return None
    
    try:
        from backend.proxy_config import load_proxies
        available_proxies = load_proxies()
        
        if proxy_label in available_proxies:
            return available_proxies[proxy_label]
    except Exception as e:
        logging.error(f"[VaultConfig] Error getting proxy config '{proxy_label}': {e}")
    
    return None
