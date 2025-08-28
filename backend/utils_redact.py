# utils_redact.py
# Utility to recursively redact sensitive fields from dicts for logging/event logs

REDACT_KEYS = {'webhook_url', 'discord_webhook', 'password', 'mam_id', 'browser_cookie', 'token', 'api_key', 'smtp_password'}
REDACTED = '********'

def redact_sensitive(data):
    if isinstance(data, dict):
        return {k: (REDACTED if k in REDACT_KEYS else redact_sensitive(v)) for k, v in data.items()}
    elif isinstance(data, list):
        return [redact_sensitive(item) for item in data]
    else:
        return data

# Example usage:
# log.info('Event: %s', redact_sensitive(event_dict))
