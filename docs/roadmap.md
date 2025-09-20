This document contains a list of planned enhancements

# Planned

- Proxy test - Provide the ability to natively test individual proxy connections
- Wedge/Cheese - Display the current browser session's cheese and wedge counts (requires scraping)

## Session Expiry Tracking

- Track mam_id session alive-time and provide convenient features for updating and notification

### Automated Validation

- Build a date/time input for mam_id expiry tracking (sessions expire after 90 days)
- Configuration to notify the user when expiry is upcoming (both UI and push (if configured))
- Configuration to notify the user post-expiry (both UI and push (if configured))

### Semi-Automated Renewal Flow

- Provide a “one-click” button that opens MAM’s session page in the browser with instructions for updating the mam_id

## Prowlarr Integration

- Create a button in the UI that will update the mam_id indexer field in Prowlarr (if possible), explore alternatives if direct API integration isn't feasible.
- Optionally automate mam_id Prowlarr indexer updates (when mam_id for a session changes (via manual update, on save)), update mam_id for MAM indexer in Prowlarr (dependent on #1).
- Create Event Log for mam_id change updates (short-term retention)
