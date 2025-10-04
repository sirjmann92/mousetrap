# Donation History Integration

## Overview

**Date:** October 4, 2025  
**Feature:** Integrated MAM donation history with MouseTrap donation tracking

## Problem Solved

Users were confused when they manually donated on the MAM website but MouseTrap showed an older "Last Donation" timestamp. This was because MouseTrap only tracked donations it made itself, not manual donations on the website.

## Solution

We now fetch donation history from MAM and intelligently merge it with MouseTrap's tracking to show the most accurate last donation information.

---

## How It Works

### Backend Changes

#### 1. Enhanced Vault Total Points Function
**File:** `backend/millionaires_vault_cookies.py`

This function was enhanced to also parse user donation history, returning structured data with timestamps and amounts.

#### 2. Enhanced GET Vault Configuration Endpoint
**File:** `backend/app.py` - `api_get_vault_configuration()`

When fetching a vault configuration, the endpoint now:

1. Fetches MAM donation history from pot.php
2. Compares MAM's last donation with MouseTrap's last donation
3. Determines which one to display based on timestamps
4. Returns merged data in `last_donation_display` field

**Smart Merging Logic:**

```python
# If timestamps are within 5 seconds, treat as same donation
if time_diff <= 5:
    # Show MouseTrap data (has Type: Manual/Automatic)
    last_donation_display = {
        "timestamp": mousetrap_timestamp,
        "amount": mousetrap_amount,
        "type": "Manual" or "Automated",
        "source": "MouseTrap"
    }
else:
    # MAM donation is different (and more recent)
    last_donation_display = {
        "timestamp": mam_timestamp,
        "amount": mam_amount,
        "type": None,  # Don't show type for MAM donations
        "source": "MyAnonamouse"
    }
```

### Frontend Changes

#### Updated VaultConfigCard Component
**File:** `frontend/src/components/VaultConfigCard.jsx`

Changed from "Last MouseTrap Donation" to "Last Donation" and now displays:

- **Time:** The timestamp of the last donation
- **Amount:** Points donated
- **Source:** Either "MouseTrap" or "MyAnonamouse"
- **Type:** Only shown if source is MouseTrap (Manual/Automated)

**Display Examples:**

**Example 1: MouseTrap donation (same as MAM)**
```
Last Donation
Time: 10/3/2025, 1:57:27 AM
Amount: 2,000 points
Source: MouseTrap
Type: Manual
```

**Example 2: Manual MAM donation (different from MouseTrap)**
```
Last Donation
Time: 10/3/2025, 1:57:27 AM
Amount: 2,000 points
Source: MyAnonamouse
```

---

## Benefits

1. ✅ **Accurate Information:** Shows actual last donation regardless of source
2. ✅ **No User Confusion:** Users see their manual donations immediately
3. ✅ **Smart Merging:** Doesn't duplicate donations made through MouseTrap
4. ✅ **Low Overhead:** Uses existing pot.php fetch (no extra requests)
5. ✅ **Graceful Degradation:** Falls back to MouseTrap tracking if scraping fails

---

## Technical Details

### Authentication
Uses browser credentials (mam_id and UID) with proper User-Agent headers.

### Data Processing
- Parses donation data with RFC 2822 date format
- Handles comma-separated number formatting
- 5-second tolerance window to match same donations from both sources

---

## Error Handling

- **Non-Fatal:** If MAM data fetching fails, falls back to MouseTrap data only
- **Logged:** Failures are logged as warnings (not errors)
- **No Impact:** Vault configuration still loads even if enrichment fails

---

## Benefits

## Changelog Entry

**October 4, 2025 - Donation History Integration & Cheese/Wedges Display**

**New Features:**
- Integrated MAM donation history with MouseTrap tracking
- Added Cheese and Wedges display in Vault Config card
- Smart merging logic compares timestamps to avoid duplication
- Displays source (MouseTrap/MyAnonamouse) and type (Manual/Automated for MouseTrap only)
- Conditional divider display (only shows when Last Donation exists)

**Technical Details:**
- Enhanced donation history parsing from MAM vault pages
- Updated vault configuration API endpoint to merge MouseTrap and MAM data
- Added cheese/wedges scraping from MAM navigation header
- 5-second tolerance window to match same donations from both sources
- Graceful fallback to MouseTrap tracking if MAM data fetching fails
- Cheese and wedges fetched from browser account (separate from session points)

**User Impact:**
- No more confusion about "missing" donations
- Accurate last donation timestamp regardless of donation method
- Clear indication of donation source
- See Cheese and Wedges totals alongside Points
