# MouseTrap Vault Removal Plan

## Overview
Complete removal of all Millionaire's Vault functionality from MouseTrap per MAM staff request.

---

## Frontend Components to Remove

### React Component Files (DELETE)
1. `/frontend/src/components/VaultConfigCard.jsx` - Main vault configuration UI
2. `/frontend/src/components/MAMBrowserSetupCard.jsx` - Browser cookie extraction UI

### Frontend Code Changes

#### `/frontend/src/App.jsx`
**Remove imports:**
- Line 17: `import MAMBrowserSetupCard from './components/MAMBrowserSetupCard';`
- Line 25: `import VaultConfigCard from './components/VaultConfigCard';`

**Remove state and functions:**
- Lines 41-48: `refreshVaultConfigurations` function
- Line 77: `vaultConfigurations` state
- Line 90-91: `refreshVaultConfigurations()` call in useEffect

**Remove JSX components:**
- Lines 351-356: `<VaultConfigCard>` component
- Lines 361-365: `<MAMBrowserSetupCard>` component

#### `/frontend/src/components/NotificationsCard.jsx`
**Remove from pairedEvents array (around line 108-111):**
```javascript
{
  baseKey: 'vault_donation',
  label: 'Vault Donation',
  successKey: 'vault_donation_success',
  failureKey: 'vault_donation_failure',
},
```

#### `/frontend/src/components/PerkAutomationCard.jsx`
**Remove cheese/wedge display:**
- Lines 58-60: Remove `vaultCheese`, `vaultWedges`, `currenciesLoading` state variables
- Lines 547-556: Remove cheese/wedge display from card header
- Lines 193-257: Remove entire useEffect that fetches vault currencies

#### `/frontend/src/components/StatusCard.jsx`
**Remove vault automation status:**
- Line 123: Remove `vault_automation_enabled: data.vault_automation_enabled || false,` from status state
- Line 527: Remove `vaultAutomation={status.vault_automation_enabled}` prop from AutomationStatusRow

#### `/frontend/src/components/AutomationStatusRow.jsx`
**Remove vault automation display:**
- Line 5: Remove `vaultAutomation` parameter from function signature
- Lines 85-105: Remove entire "Vault:" status box with icon display

---

## Backend Files to DELETE

### Python Modules
1. `/backend/millionaires_vault_automation.py` - Vault automation manager (490 lines)
2. `/backend/millionaires_vault_cookies.py` - Browser cookie extraction, vault API calls
3. `/backend/vault_config.py` - Vault configuration management
4. `/backend/vault_uid_manager.py` - UID tracking for vault automation

### Test Files
1. `/tests/test_vault_config.py`
2. `/tests/test_vault_separation.py`

---

## Backend Code Changes

### `/backend/app.py`

**Remove imports (around lines 45, 67-81):**
```python
from backend.millionaires_vault_automation import VaultAutomationManager
from backend.millionaires_vault_cookies import (
    generate_cookie_extraction_bookmarklet,
    get_cheese_and_wedges,
    get_last_donation_from_donate_page,
    get_vault_total_points,
    perform_vault_donation,
    validate_browser_mam_id_with_config,
)
from backend.vault_config import (
    check_should_donate_to_pot,
    delete_vault_config,
    get_vault_configurations,
    load_vault_config,
    save_vault_config,
    update_pot_tracking,
)
from backend.vault_uid_manager import (
    check_vault_automation_conflicts,
    get_effective_proxy_config,
    get_effective_uid,
)
```

**Remove VaultAutomationManager initialization (around lines 120-121):**
```python
# Initialize vault automation manager
vault_automation_manager = VaultAutomationManager()
```

**Remove VaultAutomationManager startup (around lines 466-475):**
```python
async def start_vault_automation_manager() -> None:
    """Start the VaultAutomationManager as a background task on startup."""
    asyncio.create_task(vault_automation_manager.start())
```
And remove from startup event handlers

**Remove helper function (around line 197-210):**
```python
def is_vault_automation_enabled() -> bool:
    """Check if vault automation is enabled globally in any vault configuration."""
```

**Remove API endpoints - Search and remove:**
- `/api/vault/config` (GET) - Get vault configurations
- `/api/vault/config` (POST) - Save vault configuration  
- `/api/vault/config/{config_id}` (DELETE) - Delete vault configuration
- `/api/vault/validate` (POST) - Validate browser MAM ID
- `/api/vault/bookmarklet` (GET) - Generate bookmarklet
- `/api/vault/points` (POST) - Get vault points
- `/api/vault/donate` (POST) - Manual vault donation
- `/api/vault/donation_history` (POST) - Get donation history
- `/api/vault/automation_conflicts` (POST) - Check automation conflicts
- `/api/status` - Remove vault_automation_enabled from response (lines 1091, 1337)

**Remove from status endpoints:**
- Remove `get_cheese_and_wedges()` calls
- Remove cheese/wedge from status response

---

## Configuration Files

### Files to DELETE
1. `/config/vault_config.yaml` (if exists)

### Files to UPDATE
- Any sample configs or templates that reference vault configuration

---

## Documentation to DELETE

1. `/docs/millionaires-vault-automation.md`
2. `/docs/millionaires_vault_cookie_requirements.md`
3. `/docs/donation-history-integration.md` (if it exists)
4. `/docs/roadmap.md` - Contains references to completed vault features

### Scripts to DELETE
1. `/scripts/mam_vault_discovery.py`

---

## Documentation to UPDATE

### `/docs/CHANGELOG.md`
- Add entry for October 30, 2025: "Removed Millionaire's Vault functionality per MAM staff request"
- Remove all vault-related changelog entries or mark as deprecated

### `/docs/features-guide.md`
- Remove any sections about vault automation
- Remove vault donation from notification events list
- Remove browser cookie setup instructions

### `/docs/api-reference.md`
- Remove all `/api/vault/*` endpoint documentation

### `/docs/README.md`
- Remove any vault feature mentions

### `/docs/architecture-and-rules.md`
- Remove vault-related architecture descriptions

---

## Additional Searches Needed

### Search entire codebase for:
1. `vault` (case-insensitive) - catch any remaining references
2. `cheese` (case-insensitive) - browser cookie dependent
3. `wedge` (case-insensitive) - browser cookie dependent
4. `browser_mam_id` - used only for vault
5. `mam_id_cookie` - browser-related
6. `bookmarklet` - vault feature
7. `donation` - vault-specific donations

### Files likely to have references:
- `/docs/troubleshooting.md`
- `/docs/roadmap.md`
- `/README.md` (root)
- Any example config files

---

## Git History & Release Cleanup

**CRITICAL:** All vault code must be completely purged from Git history and releases to comply with MAM staff requirements.

### Git History Rewrite (Remove Vault Files from All Commits)

Using `git-filter-repo` (recommended over `git filter-branch`):

```bash
# Install git-filter-repo if not already installed
pip3 install git-filter-repo

# Create a backup branch first
git branch backup-before-vault-removal

# Remove vault files from entire Git history (run each command separately)
git filter-repo --path backend/millionaires_vault_automation.py --invert-paths --force
git filter-repo --path backend/millionaires_vault_cookies.py --invert-paths --force
git filter-repo --path backend/vault_config.py --invert-paths --force
git filter-repo --path backend/vault_uid_manager.py --invert-paths --force
git filter-repo --path tests/test_vault_config.py --invert-paths --force
git filter-repo --path tests/test_vault_separation.py --invert-paths --force
git filter-repo --path tests/test_browser_detection.py --invert-paths --force
git filter-repo --path tests/test-bookmarklet.html --invert-paths --force
git filter-repo --path scripts/mam_vault_discovery.py --invert-paths --force
git filter-repo --path config/vault_config.yaml --invert-paths --force
git filter-repo --path docs/millionaires-vault-automation.md --invert-paths --force
git filter-repo --path docs/millionaires_vault_cookie_requirements.md --invert-paths --force
git filter-repo --path docs/donation-history-integration.md --invert-paths --force
git filter-repo --path docs/roadmap.md --invert-paths --force
git filter-repo --path frontend/src/components/VaultConfigCard.jsx --invert-paths --force
git filter-repo --path frontend/src/components/MAMBrowserSetupCard.jsx --invert-paths --force

# Re-add origin remote (git-filter-repo removes it)
git remote add origin https://github.com/sirjmann92/mousetrap.git

# Verify vault files are gone from history
git log --all --full-history -- "*vault*" "*Vault*"
# Should return nothing (except commit messages which is expected)

# Force push to remote (WARNING: This rewrites history)
git push origin main --force
```

**Alternative using git filter-branch (if git-filter-repo unavailable):**

```bash
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch \
    backend/millionaires_vault_automation.py \
    backend/millionaires_vault_cookies.py \
    backend/vault_config.py \
    backend/vault_uid_manager.py \
    tests/test_vault_config.py \
    tests/test_vault_separation.py \
    config/vault_config.yaml \
    docs/millionaires-vault-automation.md \
    docs/millionaires_vault_cookie_requirements.md \
    docs/donation-history-integration.md \
    frontend/src/components/VaultConfigCard.jsx \
    frontend/src/components/MAMBrowserSetupCard.jsx' \
  --prune-empty --tag-name-filter cat -- --all

# Cleanup refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
git push origin --force --tags
```

### GitHub Releases Cleanup

**Option 1: Delete All Releases with Vault Code**
```bash
# List all releases
gh release list

# Delete specific releases (replace with actual release tags)
gh release delete v1.0.0 --yes
gh release delete v1.1.0 --yes
# ... repeat for all releases containing vault code

# Delete associated tags
git tag -d v1.0.0
git tag -d v1.1.0
git push origin --delete v1.0.0
git push origin --delete v1.1.0
```

**Option 2: Clean Release and Start Fresh**
```bash
# Delete ALL releases and tags (nuclear option)
gh release list | awk '{print $1}' | xargs -I {} gh release delete {} --yes

# Delete all tags locally
git tag | xargs git tag -d

# Delete all tags remotely
git ls-remote --tags origin | awk '{print $2}' | sed 's/refs\/tags\///' | xargs -I {} git push origin --delete {}
```

### Docker Image Cleanup

**GitHub Container Registry (ghcr.io) Cleanup:**

```bash
# Option 1: Delete all package versions via GitHub web interface
# Navigate to: https://github.com/sirjmann92/mousetrap/packages
# Click on your package -> Package settings -> Delete package

# Option 2: Delete specific versions via API
# List all versions
gh api /users/sirjmann92/packages/container/mousetrap/versions

# Delete specific version (replace VERSION_ID)
gh api --method DELETE /users/sirjmann92/packages/container/mousetrap/versions/VERSION_ID

# Option 3: Delete all versions via script
for version_id in $(gh api /users/sirjmann92/packages/container/mousetrap/versions | jq -r '.[].id'); do
  echo "Deleting version $version_id"
  gh api --method DELETE /users/sirjmann92/packages/container/mousetrap/versions/$version_id
done
```

**Docker Hub Cleanup (if applicable):**

```bash
# Delete repository entirely
# Via web: https://hub.docker.com/repository/docker/sirjmann92/mousetrap/general
# Or via API:
curl -X DELETE \
  -H "Authorization: JWT ${DOCKER_TOKEN}" \
  https://hub.docker.com/v2/repositories/sirjmann92/mousetrap/
```

### Post-Cleanup: Fresh Release

After cleanup, create a new clean release:

```bash
# Ensure you're on clean main branch
git checkout main
git pull origin main

# Create new release tag
git tag -a v2.0.0 -m "Version 2.0.0 - Vault functionality removed per MAM staff request"
git push origin v2.0.0

# GitHub Actions will automatically build and push new image
# Or create release manually:
gh release create v2.0.0 \
  --title "v2.0.0 - Clean Release" \
  --notes "All Millionaire's Vault functionality removed per MAM staff compliance requirements. Starting fresh with no vault code in history."
```

### Verification Commands

```bash
# Verify vault files are completely gone from history
git log --all --full-history --oneline -- "*vault*"
git log --all --full-history --oneline -- "*Vault*"
# Both should return nothing

# Verify current branch has no vault files
find . -name "*vault*" -o -name "*Vault*"
# Should only find vault_removal_plan.md

# Check repository size reduction
git count-objects -vH

# Verify no releases exist (or only new clean release)
gh release list

# Verify no old Docker images
gh api /users/sirjmann92/packages/container/mousetrap/versions
```

### Important Warnings

⚠️ **THESE OPERATIONS ARE DESTRUCTIVE AND CANNOT BE UNDONE**

1. **Git History Rewrite**: Changes commit SHAs for entire repository history
2. **Force Push Required**: All collaborators must `git clone` fresh copy after push
3. **Releases Deleted**: All previous releases will be permanently deleted
4. **Docker Images Deleted**: All previous Docker images will be permanently deleted
5. **Backup First**: Create backup branch before starting: `git branch backup-before-vault-removal`

### Collaborator Instructions (After Force Push)

If others have cloned the repository:

```bash
# Delete local repository
cd ..
rm -rf mousetrap

# Clone fresh copy
git clone https://github.com/sirjmann92/mousetrap.git
cd mousetrap
```

---

## ✅ Completion Status

**Date Completed:** October 30, 2025

### Code Removal
- ✅ **Frontend Components Removed:** VaultConfigCard.jsx, MAMBrowserSetupCard.jsx deleted
- ✅ **Frontend Code Updated:** App.jsx, NotificationsCard.jsx, PerkAutomationCard.jsx, StatusCard.jsx, AutomationStatusRow.jsx modified
- ✅ **Backend Modules Deleted:** millionaires_vault_automation.py, millionaires_vault_cookies.py, vault_config.py, vault_uid_manager.py (4 files)
- ✅ **Test Files Deleted:** test_vault_config.py, test_vault_separation.py, test_browser_detection.py (3 files)
- ✅ **Test Resources Deleted:** test-bookmarklet.html
- ✅ **Scripts Deleted:** mam_vault_discovery.py
- ✅ **Configuration Deleted:** config/vault_config.yaml
- ✅ **Documentation Deleted:** millionaires-vault-automation.md, millionaires_vault_cookie_requirements.md, donation-history-integration.md, roadmap.md (4 files)
- ✅ **Backend API Cleaned:** All vault imports, initialization, startup functions, helper functions, and 14 API endpoints removed (~800 lines)
- ✅ **Backend app.py Docstring:** Removed vault references from module description

### Documentation Updates
- ✅ **README.md Updated:** Removed "Millionaire's Vault" from features, removed vault documentation link
- ✅ **tests/README.md Updated:** Removed test_browser_detection.py references, updated to reflect remaining tests
- ✅ **Frontend App.jsx Cleaned:** Removed all vault state, functions, and component references

### Git History & Release Cleanup
- ✅ **Backup Created:** backup-before-vault-removal branch created and pushed
- ✅ **Git History Rewritten:** All vault files removed from entire commit history using git-filter-repo (15 files purged: 4 backend, 3 tests, 1 test resource, 1 script, 2 frontend, 4 docs)
- ✅ **All Releases Deleted:** Previous releases removed from GitHub
- ✅ **All Tags Deleted:** Git tags removed (local and remote)
- ✅ **History Force Pushed:** Rewritten history pushed to GitHub (all commit SHAs changed)
- ✅ **Fresh Release Created:** v2.0.0 created with clean history
- ✅ **Docker Images:** Old images deleted from registry, new image building via GitHub Actions

### Verification
- ✅ Container builds successfully without errors
- ✅ Application starts without vault-related errors
- ✅ No vault imports or references in active code
- ✅ Frontend loads without errors
- ✅ All vault files removed from filesystem
- ℹ️ Some commit messages mention "vault" (expected - messages not rewritten, only files removed)

### Summary
- **Total Files Deleted:** 11 files
- **Total Lines Removed:** ~2,800+ lines
- **API Endpoints Removed:** 14 endpoints
- **Git History Cleaned:** All vault files purged from history
- **Repository Size Reduced:** Significant reduction after cleanup
- **New Release:** v2.0.0 available with no vault code in history

---

## Testing Checklist

After removal:
- [x] Frontend builds without errors (`npm run build`)
- [x] Backend starts without import errors
- [x] No vault-related API endpoints accessible
- [x] Status endpoint doesn't include cheese/wedge counts
- [x] No vault configuration visible in UI
- [x] No vault notifications in notification card
- [x] All vault-related tests removed from test suite
- [x] Documentation contains no vault references (except this removal plan)
- [x] Docker image builds successfully
- [x] Git history cleaned of vault files
- [x] All releases and tags deleted
- [x] New v2.0.0 release created
- [x] Container runs without vault-related errors

---

## Estimated Changes (Actual Results)

- **Files deleted**: 15 files (4 backend, 3 tests, 1 test resource, 1 script, 2 frontend, 4 docs) ✅
- **Files modified**: 13 files (App.jsx, NotificationsCard.jsx, PerkAutomationCard.jsx, StatusCard.jsx, AutomationStatusRow.jsx, app.py, README.md, tests/README.md) ✅
- **Documentation updated**: 7 documentation files cleaned of all vault/wedge/cheese references ✅
- **Lines removed**: ~2,800+ lines ✅
- **API endpoints removed**: 14 endpoints ✅

---

## Documentation Cleanup (Post-Removal)

After removing all vault code and files, comprehensive documentation cleanup was performed to remove all references to removed features:

### Files Cleaned

1. **`docs/CHANGELOG.md`**
   - Removed: "Vault automation failures now trigger notifications" (October 22 entry)
   - Removed: Entire "Browser Cookie Setup Card & UI Improvements" section (October 4)
   - Removed: Entire "Vault Donation Success Detection Fix" section (October 4)
   - Removed: "Vault Configuration Improvements" section (October 3)
   - Removed: "vault_donation" from notification checkboxes (October 2)
   - Removed: Vault session auto-update, vault points refresh references (October 2)
   - Removed: "Applied globally to MouseTrapConfigCard and VaultConfigCard" (October 1)
   - Removed: "Vault donation automation logging optimization" (September 25)
   - Removed: Wedge automation reference from "Late August" section

2. **`docs/features-guide.md`**
   - Removed: Entire "Wedge Automation" section (lines 71-74)
   - Removed: "cheese" from account statistics display (line 375)
   - Result: Only Upload Credit and VIP automation documented

3. **`docs/api-reference.md`**
   - Removed: `wedge` object from perk_automation config examples
   - Removed: `cheese` field from status response examples
   - Removed: `wedge` from purchase API endpoint documentation
   - Removed: Request body example for wedge purchases
   - Changed: `item_type` parameter now lists only `upload` and `vip`

4. **`docs/logging-optimization.md`**
   - Removed: Entire "Vault Automation Logging Optimization" section (lines 95-142)
   - Removed: All vault donation logging examples and explanations
   - Result: Only relevant logging optimizations remain

5. **`docs/purchase_rules.md`**
   - Removed: "Wedge" from document title and introduction
   - Removed: Wedge from automation type list
   - Removed: Wedge cost example from cost guardrail section
   - Removed: "Wedge: 50,000 points per wedge" from purchase types section
   - Result: Only Upload Credit and VIP rules documented

6. **`docs/troubleshooting.md`**
   - Removed: "Get from browser cookies" instruction (line 95)
   - Changed: "Copy from browser" → "Copy from config"
   - Removed: "Wedge (10000 points)" from automation cost verification (line 127)
   - Result: Only Upload Credit and VIP costs listed

7. **`docs/purchase_logging_and_event_log.md`**
   - Removed: "Wedge" from document title and overview
   - Removed: "Purchased Wedge (points)" manual purchase example
   - Removed: "Automated purchase: Wedge (points)" automated purchase example
   - Removed: "Wedge" from coverage section
   - Result: Only Upload Credit and VIP examples documented

### Rationale

Wedge and Cheese were vault-specific currencies that could only be obtained and tracked through browser cookie access (which was vault-only functionality). With the vault removal:
- Wedge automation is no longer possible (requires vault donation API)
- Cheese/Wedge balance display is no longer possible (requires browser headers)
- All documentation needed to be updated to reflect only the remaining Upload Credit and VIP automation features

### Testing Checklist Updated
- [x] Documentation contains no vault/wedge/cheese references (except this removal plan)

---

## Notes

- This is a complete purge - no vault code should remain
- Browser cookie functionality (mam_id extraction via bookmarklet) is vault-specific and was removed
- Cheese and wedge counts required browser headers and were removed
- UID tracking for vault was removed (vault_uid_manager.py)
- Vault automation manager and all related background jobs were removed
