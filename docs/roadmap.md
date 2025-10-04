This document contains a list of planned enhancements

# Planned

- Wedge/Cheese - Display the current browser session's cheese and wedge counts (requires scraping)
- Lottery automation
- COMPLETED: Simplify notification options (reduce rows with success/failure options)
- COMPLETED: Vault integration w/ automation

## Session Expiry Tracking

- COMPLETED: Track mam_id session alive-time and provide convenient features for updating and notification

### Automated Validation

- COMPLETED: Build a date/time input for mam_id expiry tracking (sessions expire after 90 days)
- COMPLETED: Configuration to notify the user when expiry is upcoming (both UI and push (if configured))
- COMPLETED: Configuration to notify the user post-expiry (both UI and push (if configured))

### Semi-Automated Renewal Flow

- COMPLETED: Provide a link to MAM’s session page

## Prowlarr Integration

- COMPLETED: Create a button in the UI that will update the mamId indexer field in Prowlarr
- COMPLETED: Create Event Log for mam_id change updates (short-term retention)
