This document contains a list of planned enhancements

# Planned

- Wedge/Cheese - Display the current browser session's cheese and wedge counts (requires scraping)
- Lottery automation
- Simplify notification options (reduce rows with success/failure options)

## Session Expiry Tracking

- Track mam_id session alive-time and provide convenient features for updating and notification

### Automated Validation

- Build a date/time input for mam_id expiry tracking (sessions expire after 90 days)
- Configuration to notify the user when expiry is upcoming (both UI and push (if configured))
- Configuration to notify the user post-expiry (both UI and push (if configured))

### Semi-Automated Renewal Flow

- Provide a “one-click” button that opens MAM’s session page with instructions for updating the mam_id

## Prowlarr Integration

- Create a button in the UI that will update the mamId indexer field in Prowlarr
- Create Event Log for mam_id change updates (short-term retention)

```
curl -s -H "X-Api-Key: API_KEY" "http://localhost:9696/api/v1/indexer/160" \
| jq '.fields |= map(if .name == "mamId" then .value = "NEW_MAM_ID" else . end)' \
| curl -X PUT "http://localhost:9696/api/v1/indexer/160" \
   -H "X-Api-Key: API_KEY" -H "Content-Type: application/json" -d @-
```
