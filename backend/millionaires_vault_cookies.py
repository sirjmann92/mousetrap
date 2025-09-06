"""
Millionaire's Vault cookie validation and management utilities
"""

import re
import requests
import logging
from typing import Dict, Tuple, Optional, Any
from backend.utils import build_proxy_dict


def build_browser_cookies_from_session(session_config: Dict, browser_mam_id: str) -> str:
    """
    Build browser cookie string using browser mam_id + existing uid from session data
    
    Args:
        session_config: Session configuration containing last_status with uid
        browser_mam_id: Browser mam_id (different from seedbox mam_id)
    
    Returns:
        Properly formatted cookie string: "mam_id=browser_value; uid=session_uid"
    """
    if not browser_mam_id:
        return ""
    
    # Extract uid from existing session data
    uid = session_config.get('last_status', {}).get('raw', {}).get('uid')
    
    if not uid:
        return ""
    
    return f"mam_id={browser_mam_id}; uid={uid}"


def parse_browser_mam_id(cookie_string_or_mam_id: str) -> str:
    """
    Extract just the browser mam_id from either a full cookie string or standalone mam_id
    
    Args:
        cookie_string_or_mam_id: Either "mam_id=value; uid=value" or just "mam_id_value"
    
    Returns:
        Just the mam_id value
    """
    if not cookie_string_or_mam_id:
        return ""
    
    # If it looks like a cookie string, parse it
    if ';' in cookie_string_or_mam_id and '=' in cookie_string_or_mam_id:
        cookies = parse_browser_cookies(cookie_string_or_mam_id)
        return cookies.get('mam_id', '')
    
    # Otherwise treat as standalone mam_id
    return cookie_string_or_mam_id.strip()


def parse_browser_cookies(cookie_string: str) -> Dict[str, str]:
    """
    Parse browser cookie string into mam_id and uid components
    
    Args:
        cookie_string: Browser cookie string (e.g., "mam_id=abc123; uid=456789")
    
    Returns:
        Dict with 'mam_id' and 'uid' keys, empty strings if not found
    """
    result = {'mam_id': '', 'uid': ''}
    
    if not cookie_string:
        return result
    
    # Parse cookie string - handle various formats
    cookie_pairs = [pair.strip() for pair in cookie_string.split(';')]
    
    for pair in cookie_pairs:
        if '=' in pair:
            key, value = pair.split('=', 1)
            key = key.strip()
            value = value.strip()
            
            if key == 'mam_id':
                result['mam_id'] = value
            elif key == 'uid':
                result['uid'] = value
    
    return result


def validate_browser_mam_id(browser_mam_id: str, session_config: Dict, proxy_cfg: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Validate browser mam_id by combining with existing session UID and testing vault access
    
    Args:
        browser_mam_id: Browser mam_id value 
        session_config: Session configuration containing uid and vault preferences
        proxy_cfg: Proxy configuration if needed
    
    Returns:
        Dict with validation results
    """
    result = {
        'valid': False,
        'has_browser_mam_id': False,
        'has_session_uid': False,
        'vault_accessible': False,
        'cookie_string': '',
        'error': None
    }
    
    try:
        # Check if we have browser mam_id
        result['has_browser_mam_id'] = bool(browser_mam_id)
        
        # Get UID from existing session data
        uid = session_config.get('last_status', {}).get('raw', {}).get('uid')
        result['has_session_uid'] = bool(uid)
        
        if not result['has_browser_mam_id']:
            result['error'] = 'Browser mam_id is required'
            return result
            
        if not result['has_session_uid']:
            result['error'] = 'Session UID not found. Please refresh session status first.'
            return result
        
        # Build full cookie string
        cookie_string = f"mam_id={browser_mam_id}; uid={uid}"
        result['cookie_string'] = cookie_string
        
        logging.info(f"[validate_browser_mam_id] Testing browser_mam_id with session UID {uid}")
        
        # Parse cookies for validation
        cookies = {'mam_id': browser_mam_id, 'uid': str(uid)}
        
        # Use auto vault connection method (try direct first, then proxy fallback)
        vault_method = 'auto'
        
        # Use proper browser headers to prevent logout
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        vault_url = 'https://www.myanonamouse.net/millionaires/donate.php'
        
        if vault_method == 'proxy':
            # Only try proxy
            return _try_vault_access_proxy(vault_url, cookies, headers, proxy_cfg, result)
        elif vault_method == 'direct':
            # Only try direct
            return _try_vault_access_direct(vault_url, cookies, headers, result)
        else:
            # Auto mode - try direct first, then proxy
            return _try_vault_access_auto(vault_url, cookies, headers, proxy_cfg, result)
            
    except Exception as e:
        result['error'] = f'Validation error: {str(e)}'
        logging.error(f"[validate_browser_mam_id] Exception: {e}")
    
    return result


def _try_vault_access_direct(vault_url: str, cookies: Dict, headers: Dict, result: Dict) -> Dict:
    """Try vault access via direct connection"""
    try:
        logging.info(f"[validate_browser_mam_id] Attempting vault access via direct connection")
        
        resp = requests.get(vault_url, cookies=cookies, headers=headers, timeout=10)
        
        logging.info(f"[validate_browser_mam_id] Direct access result: status={resp.status_code}")
        
        if resp.status_code == 200:
            html = resp.text.lower()
            has_login_form = 'type="password"' in html or 'name="password"' in html
            has_login_text = 'login' in html and ('username' in html or 'password' in html)
            has_vault_terms = any(term in html for term in ['donation', 'millionaire', 'vault', 'contribute', 'donate'])
            
            logging.info(f"[validate_browser_mam_id] Direct access analysis: login_form={has_login_form}, login_text={has_login_text}, vault_terms={has_vault_terms}")
            
            if not (has_login_form or has_login_text) and has_vault_terms:
                result['vault_accessible'] = True
                result['valid'] = True
                result['access_method'] = 'direct'
                logging.info(f"[validate_browser_mam_id] Vault access successful via direct connection!")
            else:
                result['error'] = 'Direct connection failed - browser MAM ID may be tied to different IP'
        else:
            result['error'] = f'Direct connection HTTP {resp.status_code}'
            
    except Exception as e:
        result['error'] = f'Direct connection failed: {str(e)}'
        logging.warning(f"[validate_browser_mam_id] Direct access failed: {e}")
    
    return result


def _try_vault_access_proxy(vault_url: str, cookies: Dict, headers: Dict, proxy_cfg: Optional[Dict], result: Dict) -> Dict:
    """Try vault access via proxy connection"""
    try:
        if not proxy_cfg:
            result['error'] = 'Proxy method selected but no proxy configured'
            return result
            
        proxies = build_proxy_dict(proxy_cfg)
        if not proxies:
            result['error'] = 'Proxy method selected but proxy configuration invalid'
            return result
            
        logging.info(f"[validate_browser_mam_id] Attempting vault access via proxy")
        
        resp = requests.get(vault_url, cookies=cookies, proxies=proxies, headers=headers, timeout=10)
        
        logging.info(f"[validate_browser_mam_id] Proxy access result: status={resp.status_code}")
        
        if resp.status_code == 200:
            html = resp.text.lower()
            has_login_form = 'type="password"' in html or 'name="password"' in html
            has_login_text = 'login' in html and ('username' in html or 'password' in html)
            has_vault_terms = any(term in html for term in ['donation', 'millionaire', 'vault', 'contribute', 'donate'])
            
            logging.info(f"[validate_browser_mam_id] Proxy access analysis: login_form={has_login_form}, login_text={has_login_text}, vault_terms={has_vault_terms}")
            
            if not (has_login_form or has_login_text) and has_vault_terms:
                result['vault_accessible'] = True
                result['valid'] = True
                result['access_method'] = 'proxy'
                logging.info(f"[validate_browser_mam_id] Vault access successful via proxy!")
            else:
                result['error'] = 'Proxy connection failed - browser MAM ID may not work with this proxy IP'
        else:
            result['error'] = f'Proxy connection HTTP {resp.status_code}'
            
    except Exception as e:
        result['error'] = f'Proxy connection failed: {str(e)}'
        logging.warning(f"[validate_browser_mam_id] Proxy access failed: {e}")
    
    return result


def _try_vault_access_auto(vault_url: str, cookies: Dict, headers: Dict, proxy_cfg: Optional[Dict], result: Dict) -> Dict:
    """Try vault access - direct first, then proxy fallback"""
    # First try direct
    logging.info(f"[validate_browser_mam_id] Auto mode: trying direct connection first")
    result = _try_vault_access_direct(vault_url, cookies, headers, result)
    
    if result['valid']:
        return result
    
    # If direct failed and we have proxy config, try proxy
    if proxy_cfg:
        logging.info(f"[validate_browser_mam_id] Auto mode: direct failed, trying proxy")
        result = _try_vault_access_proxy(vault_url, cookies, headers, proxy_cfg, result)
        
        if result['valid']:
            return result
    
    # If we get here, both methods failed
    result['error'] = 'Both direct and proxy connections failed - browser MAM ID may be tied to different IP'
    logging.warning(f"[validate_browser_mam_id] Auto mode: both direct and proxy access failed")
    
    return result


def check_seedbox_session_health(mam_id: str, proxy_cfg: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Check if seedbox mam_id is working for basic API access
    Used for pre-validation before requesting browser cookies
    
    Args:
        mam_id: Seedbox mam_id
        proxy_cfg: Proxy configuration if needed
    
    Returns:
        Dict with health check results
    """
    result = {
        'valid': False,
        'points': None,
        'error': None
    }
    
    try:
        proxies = build_proxy_dict(proxy_cfg) if proxy_cfg else None
        api_url = 'https://www.myanonamouse.net/jsonLoad.php?snatch_summary'
        cookies = {'mam_id': mam_id}
        
        resp = requests.get(api_url, cookies=cookies, proxies=proxies, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict) and 'seedbonus' in data:
                result['valid'] = True
                result['points'] = data.get('seedbonus')
            else:
                result['error'] = 'Invalid API response format'
        else:
            result['error'] = f'HTTP {resp.status_code} - possible ASN mismatch or invalid mam_id'
            
    except Exception as e:
        result['error'] = f'Health check error: {str(e)}'
        logging.warning(f"[check_seedbox_session_health] Error: {e}")
    
    return result


def generate_cookie_extraction_bookmarklet() -> str:
    """
    Generate a JavaScript bookmarklet for easy cookie extraction from browser
    
    Returns:
        JavaScript bookmarklet code
    """
    js_code = """
    javascript:(function(){
        var cookies = document.cookie.split(';');
        var mam_id = '';
        var uid = '';
        
        for(var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if(cookie.startsWith('mam_id=')) {
                mam_id = cookie.substring(7);
            } else if(cookie.startsWith('uid=')) {
                uid = cookie.substring(4);
            }
        }
        
        if(mam_id && uid) {
            prompt('Copy this Browser MAM ID for MouseTrap:', mam_id);
        } else {
            alert('MAM cookies not found. Make sure you are logged into MyAnonamouse.net');
        }
    })();
    """
    
    return js_code.strip()


def get_cookie_health_status(browser_mam_id: str, session_config: Dict, proxy_cfg: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Get detailed health status of browser mam_id + session uid combination
    
    Args:
        browser_mam_id: Browser mam_id value
        session_config: Session configuration containing uid
        proxy_cfg: Proxy configuration if needed
    
    Returns:
        Dict with detailed health information
    """
    if not browser_mam_id:
        return {
            'status': 'missing',
            'message': 'No browser mam_id configured',
            'action_needed': 'Enter browser mam_id for Millionaire\'s Vault automation'
        }
    
    # Check if we have UID from session
    uid = session_config.get('last_status', {}).get('raw', {}).get('uid')
    if not uid:
        return {
            'status': 'missing_uid',
            'message': 'Session UID not available',
            'action_needed': 'Refresh session status to get UID from MAM'
        }
    
    validation = validate_browser_mam_id(browser_mam_id, session_config, proxy_cfg)
    
    if validation['valid']:
        return {
            'status': 'healthy',
            'message': 'Browser mam_id is valid and vault is accessible',
            'action_needed': None,
            'cookie_string': validation['cookie_string']
        }
    elif not validation['has_browser_mam_id']:
        return {
            'status': 'invalid_format',
            'message': 'Browser mam_id is required',
            'action_needed': 'Enter your browser mam_id (different from seedbox mam_id)'
        }
    else:
        return {
            'status': 'expired',
            'message': f'Browser mam_id appears invalid: {validation["error"]}',
            'action_needed': 'Get fresh browser mam_id from your browser session'
        }


def validate_browser_mam_id_with_config(browser_mam_id: str, uid: str, proxy_cfg: Optional[Dict] = None, connection_method: str = "auto") -> Dict[str, Any]:
    """
    Validate browser mam_id with direct configuration (for vault config API)
    
    Args:
        browser_mam_id: Browser mam_id value 
        uid: UID to use for validation
        proxy_cfg: Proxy configuration if needed
        connection_method: "direct", "proxy", or "auto"
    
    Returns:
        Dict with validation results
    """
    result = {
        'valid': False,
        'has_browser_mam_id': False,
        'has_session_uid': False,
        'vault_accessible': False,
        'cookie_string': '',
        'error': None
    }
    
    try:
        # Check if we have browser mam_id
        result['has_browser_mam_id'] = bool(browser_mam_id)
        result['has_session_uid'] = bool(uid)
        
        if not result['has_browser_mam_id']:
            result['error'] = 'Browser mam_id is required'
            return result
            
        if not result['has_session_uid']:
            result['error'] = 'UID is required'
            return result
        
        # Build full cookie string
        cookie_string = f"mam_id={browser_mam_id}; uid={uid}"
        result['cookie_string'] = cookie_string
        
        logging.info(f"[validate_browser_mam_id_with_config] Testing browser_mam_id with UID {uid}")
        
        # Parse cookies for validation
        cookies = {'mam_id': browser_mam_id, 'uid': str(uid)}
        
        # Use proper browser headers to prevent logout
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        vault_url = 'https://www.myanonamouse.net/millionaires/donate.php'
        
        if connection_method == 'proxy':
            # Only try proxy
            return _try_vault_access_proxy(vault_url, cookies, headers, proxy_cfg, result)
        elif connection_method == 'direct':
            # Only try direct
            return _try_vault_access_direct(vault_url, cookies, headers, result)
        else:
            # Auto mode - try direct first, then proxy
            return _try_vault_access_auto(vault_url, cookies, headers, proxy_cfg, result)
            
    except Exception as e:
        result['error'] = f'Validation error: {str(e)}'
        logging.error(f"[validate_browser_mam_id_with_config] Exception: {e}")
    
    return result


def get_vault_total_points(mam_id: str, uid: str, proxy_cfg: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Get the current total points in the Millionaire's Vault (community total)
    
    Args:
        mam_id: Extracted mam_id value (not full browser cookie string)
        uid: User ID 
        proxy_cfg: Optional proxy configuration
        
    Returns:
        Dict with vault_total_points and status
    """
    result = {
        'success': False,
        'vault_total_points': None,
        'error': None
    }
    
    try:
        # Prepare cookies and headers
        cookies = {
            'mam_id': mam_id,
            'uid': uid
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        vault_url = "https://www.myanonamouse.net/millionaires/donate.php"
        
        # Get the vault page
        if proxy_cfg:
            from backend.utils import build_proxy_dict
            proxies = build_proxy_dict(proxy_cfg)
            resp = requests.get(vault_url, cookies=cookies, headers=headers, proxies=proxies, timeout=15)
        else:
            resp = requests.get(vault_url, cookies=cookies, headers=headers, timeout=10)
        
        if resp.status_code != 200:
            result['error'] = f'Failed to access vault page: HTTP {resp.status_code}'
            return result
        
        html = resp.text
        
        # Check if logged in
        if 'type="password"' in html.lower() or 'name="password"' in html.lower():
            result['error'] = 'Not logged in - browser MAM ID may be expired'
            return result
        
        # Parse vault total points from the page
        import re
        # Look for patterns like "16,332,800 points" on the vault page
        points_match = re.search(r'(\d+(?:,\d+)*)\s*points?', html, re.IGNORECASE)
        if points_match:
            points_str = points_match.group(1).replace(',', '')
            result['vault_total_points'] = int(points_str)
            result['success'] = True
            logging.info(f"[get_vault_total_points] Current vault total: {result['vault_total_points']:,} points")
        else:
            result['error'] = 'Could not parse vault total points from page'
            
    except Exception as e:
        result['error'] = f"Error fetching vault total: {str(e)}"
        logging.error(f"[get_vault_total_points] Exception: {e}")
    
    return result


def perform_vault_donation(browser_mam_id: str, uid: str, amount: int, proxy_cfg: Optional[Dict] = None, connection_method: str = "auto", verification_mam_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Perform actual vault donation to MAM with unified verification approach
    
    Args:
        browser_mam_id: Browser mam_id value 
        uid: UID to use for donation
        amount: Amount to donate (100-2000 points)
        proxy_cfg: Proxy configuration if needed
        connection_method: "direct", "proxy", or "auto"
        verification_mam_id: Optional session mam_id for points verification
    
    Returns:
        Dict with donation results including points_before and points_after
    """
    result = {
        'success': False,
        'amount_donated': 0,
        'points_before': None,
        'points_after': None,
        'vault_total_points': None,  # Community vault total
        'error': None,
        'access_method': None,
        'verification_method': None
    }
    
    try:
        # Validate amount
        if not isinstance(amount, int) or amount < 100 or amount > 2000 or amount % 100 != 0:
            result['error'] = "Invalid donation amount. Must be 100-2000 points in increments of 100."
            return result
        
        # Get session configuration for verification if verification_mam_id provided
        session_config = None
        session_proxy_cfg = None
        if verification_mam_id:
            try:
                from backend.config import list_sessions, load_session
                sessions = list_sessions()
                
                for label in sessions:
                    config = load_session(label)
                    if config.get("mam", {}).get("mam_id") == verification_mam_id:
                        session_config = config
                        session_proxy_cfg = config.get('proxy')
                        result['verification_method'] = f'session_{label}'
                        break
                        
                if session_config:
                    logging.info(f"[perform_vault_donation] Using session-based verification with mam_id: {verification_mam_id}")
                else:
                    logging.warning(f"[perform_vault_donation] Could not find session with mam_id {verification_mam_id}")
            except Exception as e:
                logging.warning(f"[perform_vault_donation] Error loading session for verification: {e}")
        
        # Step 1: Get points BEFORE donation
        if session_config and verification_mam_id:
            try:
                from backend.mam_api import get_status
                status_before = get_status(mam_id=verification_mam_id, proxy_cfg=session_proxy_cfg)
                result['points_before'] = status_before.get('points')
                logging.info(f"[perform_vault_donation] Points before donation (session): {result['points_before']}")
            except Exception as e:
                logging.warning(f"[perform_vault_donation] Could not get points before donation via session: {e}")
        else:
            result['verification_method'] = 'browser_fallback'
            logging.info(f"[perform_vault_donation] No session available for verification")
        
        # Prepare cookies and headers
        cookies = {
            'mam_id': browser_mam_id,
            'uid': uid
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        # MAM vault donation URL
        vault_donation_url = "https://www.myanonamouse.net/millionaires/donate.php"
        
        # Step 2: Perform the actual donation
        if connection_method == "direct":
            donation_result = _perform_vault_donation_direct(vault_donation_url, cookies, headers, amount, {}, verification_mam_id)
        elif connection_method == "proxy":
            donation_result = _perform_vault_donation_proxy(vault_donation_url, cookies, headers, amount, proxy_cfg, {}, verification_mam_id)
        elif connection_method == "auto":
            donation_result = _perform_vault_donation_auto(vault_donation_url, cookies, headers, amount, proxy_cfg, {}, verification_mam_id)
        else:
            result['error'] = f"Invalid connection method: {connection_method}"
            return result
        
        # Copy donation result data
        result['access_method'] = donation_result.get('access_method')
        
        # Step 3: Get points AFTER donation and determine final success
        if session_config and verification_mam_id and result['points_before'] is not None:
            try:
                # Wait a moment for the donation to be processed
                import time
                time.sleep(3)
                
                from backend.mam_api import get_status
                status_after = get_status(mam_id=verification_mam_id, proxy_cfg=session_proxy_cfg)
                result['points_after'] = status_after.get('points')
                
                if result['points_after'] is not None:
                    expected_points = result['points_before'] - amount
                    points_difference = result['points_before'] - result['points_after']
                    
                    logging.info(f"[perform_vault_donation] Unified verification - Before: {result['points_before']}, After: {result['points_after']}, Expected: {expected_points}, Actual difference: {points_difference}")
                    
                    # Check if points decreased by approximately the donation amount
                    if abs(result['points_after'] - expected_points) <= 100:  # Allow 100 point discrepancy
                        logging.info(f"[perform_vault_donation] Unified verification successful - donation confirmed")
                        result['success'] = True
                        result['amount_donated'] = amount
                    else:
                        logging.warning(f"[perform_vault_donation] Unified verification failed - points did not decrease correctly")
                        result['success'] = False
                        result['error'] = f"Donation verification failed - expected {expected_points} points, got {result['points_after']}"
                else:
                    logging.warning(f"[perform_vault_donation] Could not get points after donation")
                    result['success'] = False
                    result['error'] = "Could not verify donation - unable to check points after donation"
                        
            except Exception as e:
                logging.warning(f"[perform_vault_donation] Error during post-donation verification: {e}")
                result['success'] = False
                result['error'] = f'Donation verification error: {str(e)}'
        else:
            # No session verification available - trust the donation method result
            result['success'] = donation_result.get('success', False)
            result['amount_donated'] = donation_result.get('amount_donated', 0)
            result['error'] = donation_result.get('error')
            logging.info(f"[perform_vault_donation] No unified verification available - using donation result: {result['success']}")
        
        # Log final result
        if result['success']:
            logging.info(f"[perform_vault_donation] Final result: SUCCESS - {result['amount_donated']} points donated via {result['access_method']}")
        else:
            logging.error(f"[perform_vault_donation] Final result: FAILED - {result.get('error', 'Unknown error')}")
            
        return result
        
    except Exception as e:
        logging.error(f"[perform_vault_donation] Exception during donation: {e}")
        result['error'] = f"Donation failed: {str(e)}"
        return result


def _perform_vault_donation_direct(vault_url: str, cookies: Dict, headers: Dict, amount: int, result: Dict, verification_mam_id: Optional[str] = None) -> Dict:
    """Perform vault donation via direct connection"""
    try:
        logging.info(f"[perform_vault_donation] Attempting donation via direct connection: {amount} points")
        
        # First, get the vault page to check current points and get any required form tokens
        resp = requests.get(vault_url, cookies=cookies, headers=headers, timeout=10)
        
        if resp.status_code != 200:
            result['error'] = f'Failed to access vault page: HTTP {resp.status_code}'
            logging.error(f"[perform_vault_donation] GET request failed: {resp.status_code}")
            return result
        
        html = resp.text
        logging.debug(f"[perform_vault_donation] Vault page HTML length: {len(html)}")
        
        # Check if we're logged in (not seeing login form)
        if 'type="password"' in html.lower() or 'name="password"' in html.lower():
            result['error'] = 'Not logged in - browser MAM ID may be expired'
            return result
        
        # Parse current vault total points from the page (community total)
        import re
        points_match = re.search(r'(\d+(?:,\d+)*)\s*points?', html, re.IGNORECASE)
        if points_match:
            points_str = points_match.group(1).replace(',', '')
            result['vault_total_points'] = int(points_str)
            logging.info(f"[perform_vault_donation] Current vault total: {result['vault_total_points']:,} points")
        
        # Use the documented working format from vault documentation
        
        # Use the documented working format from vault documentation
        import time as time_module
        
        # Prepare donation form data using the exact format from documentation
        donation_data = {
            'Donation': str(amount),                    # MAM expects 'Donation', not 'amount'
            'time': str(int(time_module.time())),       # Current timestamp
            'submit': 'Donate Points'                   # Exact submit value from docs
        }
        
        # Add proper headers as documented
        headers.update({
            'Referer': vault_url,
            'Origin': 'https://www.myanonamouse.net',
            'Content-Type': 'application/x-www-form-urlencoded'
        })
        
        # Use the exact URL from documentation - no need for complex form parsing
        post_url = vault_url  # Always use the same URL for POST as documented
        
        logging.info(f"[perform_vault_donation] POST URL: {post_url}")
        logging.info(f"[perform_vault_donation] Form data: {donation_data}")
        logging.info(f"[perform_vault_donation] Headers: {headers}")
        
        # Submit donation
        donation_resp = requests.post(post_url, data=donation_data, cookies=cookies, headers=headers, timeout=10)
        
        logging.info(f"[perform_vault_donation] POST response status: {donation_resp.status_code}")
        
        if donation_resp.status_code == 200:
            donation_html = donation_resp.text.lower()
            
            # Log response snippet for debugging
            logging.info(f"[perform_vault_donation] Response preview: {donation_resp.text[:300]}")
            
            # Check for actual success indicators (not just the word "success" in HTML content)
            success_indicators = [
                'donation successful', 'donation complete', 'thank you for donating',
                'points donated', 'contribution received', 'donated successfully'
            ]
            
            has_success_indicator = any(indicator in donation_html for indicator in success_indicators)
            
            # If we don't have a clear success indicator, verify by checking points balance
            if not has_success_indicator and result.get('points_before'):
                logging.info(f"[perform_vault_donation] No clear success indicator found, verifying by checking points balance")
                
                if verification_mam_id:
                    # Using session mam_id for verification - get session config and its proxy
                    try:
                        from backend.config import list_sessions, load_session
                        sessions = list_sessions()
                        session_config = None
                        
                        # Find session with matching mam_id
                        for label in sessions:
                            config = load_session(label)
                            if config.get("mam", {}).get("mam_id") == verification_mam_id:
                                session_config = config
                                break
                        
                        if session_config:
                            from backend.mam_api import get_status
                            session_proxy_cfg = session_config.get('proxy')
                            verify_status = get_status(mam_id=verification_mam_id, proxy_cfg=session_proxy_cfg)
                            current_points = verify_status.get('points')
                            
                            if current_points is not None:
                                expected_points = result['points_before'] - amount
                                
                                logging.info(f"[perform_vault_donation] Points verification (session) - Before: {result['points_before']}, Current: {current_points}, Expected: {expected_points}")
                                
                                # Check if points decreased by approximately the donation amount
                                if abs(current_points - expected_points) <= 100:  # Allow 100 point discrepancy for rounding/timing
                                    logging.info(f"[perform_vault_donation] Points verification successful - donation appears to have worked")
                                    has_success_indicator = True
                                    result['points_after'] = current_points
                                else:
                                    logging.warning(f"[perform_vault_donation] Points verification failed - points did not decrease as expected")
                            else:
                                logging.warning(f"[perform_vault_donation] Could not verify points via session - get_status returned no points")
                        else:
                            logging.warning(f"[perform_vault_donation] Could not find session with mam_id {verification_mam_id} for verification")
                    except Exception as e:
                        logging.warning(f"[perform_vault_donation] Error during session-based verification: {e}")
                
                if not has_success_indicator:
                    # Fallback to browser mam_id verification using donation proxy
                    from backend.mam_api import get_status
                    mam_id_for_verification = cookies['mam_id']
                    
                    verify_status = get_status(mam_id=mam_id_for_verification, proxy_cfg=None)  # Use no proxy for browser verification
                    current_points = verify_status.get('points')
                    
                    if current_points is not None:
                        expected_points = result['points_before'] - amount
                        
                        logging.info(f"[perform_vault_donation] Points verification (browser) - Before: {result['points_before']}, Current: {current_points}, Expected: {expected_points}")
                        
                        # Check if points decreased by approximately the donation amount
                        if abs(current_points - expected_points) <= 100:  # Allow 100 point discrepancy for rounding/timing
                            logging.info(f"[perform_vault_donation] Points verification successful - donation appears to have worked")
                            has_success_indicator = True
                            result['points_after'] = current_points
                        else:
                            logging.warning(f"[perform_vault_donation] Points verification failed - points did not decrease as expected")
                    else:
                        logging.warning(f"[perform_vault_donation] Could not verify points - get_status returned no points")
            
            if has_success_indicator:
                result['success'] = True
                result['amount_donated'] = amount
                result['access_method'] = 'direct'
                
                # Try to parse new points total from donation response if not already set
                if not result.get('points_after'):
                    new_points_match = re.search(r'(\d+(?:,\d+)*)\s*points?', donation_resp.text, re.IGNORECASE)
                    if new_points_match:
                        points_str = new_points_match.group(1).replace(',', '')
                        result['points_after'] = int(points_str)
                
                logging.info(f"[perform_vault_donation] Direct donation successful: {amount} points")
            else:
                # Look for specific error messages
                if 'insufficient' in donation_html or 'not enough' in donation_html:
                    result['error'] = 'Insufficient points for donation'
                elif 'invalid' in donation_html or 'error' in donation_html:
                    result['error'] = 'Invalid donation request'
                elif 'form' in donation_html and ('token' in donation_html or 'csrf' in donation_html):
                    result['error'] = 'Missing or invalid security token'
                elif 'login' in donation_html or 'password' in donation_html:
                    result['error'] = 'Authentication failed - cookies may be expired'
                else:
                    result['error'] = 'Donation not processed - no success confirmation received'
                    logging.warning(f"[perform_vault_donation] No success indicators found in response")
        else:
            result['error'] = f'Donation request failed: HTTP {donation_resp.status_code}'
            logging.error(f"[perform_vault_donation] POST failed with {donation_resp.status_code}: {donation_resp.text[:200]}")
            
    except Exception as e:
        result['error'] = f'Direct donation failed: {str(e)}'
        logging.warning(f"[perform_vault_donation] Direct donation failed: {e}")
    
    return result


def _perform_vault_donation_proxy(vault_url: str, cookies: Dict, headers: Dict, amount: int, proxy_cfg: Optional[Dict], result: Dict, verification_mam_id: Optional[str] = None) -> Dict:
    """Perform vault donation via proxy connection"""
    try:
        if not proxy_cfg:
            result['error'] = 'Proxy method selected but no proxy configured'
            return result
        
        logging.info(f"[perform_vault_donation] Attempting donation via proxy: {amount} points")
        
        # Use the same logic as direct but with proxy
        proxies = build_proxy_dict(proxy_cfg)
        
        # Get vault page with proxy
        resp = requests.get(vault_url, cookies=cookies, headers=headers, proxies=proxies, timeout=15)
        
        if resp.status_code != 200:
            result['error'] = f'Failed to access vault page via proxy: HTTP {resp.status_code}'
            return result
        
        # Same donation logic as direct method but with proxies parameter
        html = resp.text
        
        if 'type="password"' in html.lower() or 'name="password"' in html.lower():
            result['error'] = 'Not logged in via proxy - browser MAM ID may be expired'
            return result
        
        # Parse points and form tokens (same as direct method)
        import re
        points_match = re.search(r'(\d+(?:,\d+)*)\s*points?', html, re.IGNORECASE)
        if points_match:
            points_str = points_match.group(1).replace(',', '')
            result['points_before'] = int(points_str)

        # Use the documented working format from vault documentation
        import time as time_module
        
        # Prepare donation form data using the exact format from documentation
        donation_data = {
            'Donation': str(amount),                    # MAM expects 'Donation', not 'amount'
            'time': str(int(time_module.time())),       # Current timestamp
            'submit': 'Donate Points'                   # Exact submit value from docs
        }
        
        # Add proper headers as documented
        headers.update({
            'Referer': vault_url,
            'Origin': 'https://www.myanonamouse.net',
            'Content-Type': 'application/x-www-form-urlencoded'
        })        # Submit donation via proxy
        donation_resp = requests.post(vault_url, data=donation_data, cookies=cookies, headers=headers, proxies=proxies, timeout=15)
        
        if donation_resp.status_code == 200:
            donation_html = donation_resp.text.lower()
            
            # Check for actual success indicators (not just the word "success" in HTML content)
            success_indicators = [
                'donation successful', 'donation complete', 'thank you for donating',
                'points donated', 'contribution received', 'donated successfully'
            ]
            
            has_success_indicator = any(indicator in donation_html for indicator in success_indicators)
            
            # If we don't have a clear success indicator, verify by checking points balance
            if not has_success_indicator and result.get('points_before'):
                logging.info(f"[perform_vault_donation] No clear success indicator found, verifying by checking points balance via proxy")
                
                # Use the existing get_status function for more reliable points checking
                from backend.mam_api import get_status
                from backend.utils import build_proxy_dict
                
                # Build proper proxy config for get_status
                proxy_cfg_for_status = None
                if proxies:
                    # Convert the requests proxies dict back to a proxy config
                    # This is a bit of a workaround - in practice the proxy_cfg should be passed through
                    http_proxy = proxies.get('http', '')
                    if http_proxy and '://' in http_proxy:
                        # Parse the proxy URL to extract components
                        import re
                        proxy_match = re.match(r'(https?)://(?:([^:]+):([^@]+)@)?([^:]+):(\d+)', http_proxy)
                        if proxy_match:
                            protocol, username, password, host, port = proxy_match.groups()
                            proxy_cfg_for_status = {
                                'host': host,
                                'port': int(port),
                                'username': username,
                                'password': password
                            }
                
                verify_status = get_status(mam_id=cookies['mam_id'], proxy_cfg=proxy_cfg_for_status)
                current_points = verify_status.get('points')
                
                if current_points is not None:
                    expected_points = result['points_before'] - amount
                    
                    logging.info(f"[perform_vault_donation] Points verification via proxy - Before: {result['points_before']}, Current: {current_points}, Expected: {expected_points}")
                    
                    # Check if points decreased by approximately the donation amount
                    if abs(current_points - expected_points) <= 100:  # Allow 100 point discrepancy for rounding/timing
                        logging.info(f"[perform_vault_donation] Points verification successful via proxy - donation appears to have worked")
                        has_success_indicator = True
                        result['points_after'] = current_points
                    else:
                        logging.warning(f"[perform_vault_donation] Points verification failed via proxy - points did not decrease as expected")
                else:
                    logging.warning(f"[perform_vault_donation] Could not verify points via proxy - get_status returned no points")
            
            if has_success_indicator:
                result['success'] = True
                result['amount_donated'] = amount
                result['access_method'] = 'proxy'
                
                # Try to parse new points total from donation response if not already set
                if not result.get('points_after'):
                    new_points_match = re.search(r'(\d+(?:,\d+)*)\s*points?', donation_resp.text, re.IGNORECASE)
                    if new_points_match:
                        points_str = new_points_match.group(1).replace(',', '')
                        result['points_after'] = int(points_str)
                
                logging.info(f"[perform_vault_donation] Proxy donation successful: {amount} points")
            else:
                # Look for specific error messages
                if 'insufficient' in donation_html or 'not enough' in donation_html:
                    result['error'] = 'Insufficient points for donation'
                elif 'invalid' in donation_html or 'error' in donation_html:
                    result['error'] = 'Invalid donation request'
                elif 'form' in donation_html and ('token' in donation_html or 'csrf' in donation_html):
                    result['error'] = 'Missing or invalid security token'
                elif 'login' in donation_html or 'password' in donation_html:
                    result['error'] = 'Authentication failed - cookies may be expired'
                else:
                    result['error'] = 'Donation not processed - no success confirmation received'
                    logging.warning(f"[perform_vault_donation] No success indicators found in proxy response")
        else:
            result['error'] = f'Donation request failed via proxy: HTTP {donation_resp.status_code}'
            
    except Exception as e:
        result['error'] = f'Proxy donation failed: {str(e)}'
        logging.warning(f"[perform_vault_donation] Proxy donation failed: {e}")
    
    return result


def _perform_vault_donation_auto(vault_url: str, cookies: Dict, headers: Dict, amount: int, proxy_cfg: Optional[Dict], result: Dict, verification_mam_id: Optional[str] = None) -> Dict:
    """Perform vault donation using auto method (try direct first, then proxy)"""
    logging.info(f"[perform_vault_donation] Attempting auto donation: {amount} points")
    
    # Try direct first
    result = _perform_vault_donation_direct(vault_url, cookies, headers, amount, result, verification_mam_id)
    
    if result.get('success'):
        return result
    
    # If direct failed and proxy is available, try proxy
    if proxy_cfg:
        logging.info(f"[perform_vault_donation] Direct failed, trying proxy: {result.get('error')}")
        # Reset result for proxy attempt
        result = {
            'success': False,
            'amount_donated': 0,
            'points_before': result.get('points_before'),  # Keep points if we got them
            'points_after': None,
            'error': None,
            'access_method': None
        }
        result = _perform_vault_donation_proxy(vault_url, cookies, headers, amount, proxy_cfg, result, verification_mam_id)
    else:
        logging.warning(f"[perform_vault_donation] Direct failed and no proxy available")
        
    return result
