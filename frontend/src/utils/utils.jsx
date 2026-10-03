/**
 * Get color for a status message (MUI palette key or hex).
 * @param {string} msg
 * @returns {string}
 */
export function getStatusMessageColor(msg) {
  if (!msg) return 'text.primary';
  if (/Rate limit: last change too recent\. Try again in (\d+) minutes\./i.test(msg)) {
    return 'warning.main';
  } else if (
    /^IP Changed\. Seedbox IP updated\.$/i.test(msg) ||
    /^ASN changed, no update needed\.$/i.test(msg) ||
    /^No change detected\. Update not needed\.$/i.test(msg)
  ) {
    return 'success.main';
  } else if (/FAILED/i.test(msg)) {
    return 'error.main';
  } else if (
    /FAILED\. Container restart attempted|FAILED\. Restart not attempted|Notification sent|Notification not sent|Cooldown active|Waiting between retries|Not enough points|Below point threshold/i.test(
      msg,
    )
  ) {
    return 'warning.main';
  } else if (/update failed|error|forbidden|failed/i.test(msg)) {
    return 'error.main';
  }
  return 'text.primary';
}
// Shared frontend utilities

/**
 * Robustly stringify any message for snackbars or logs.
 * @param {any} msg
 * @returns {string}
 */
export function stringifyMessage(msg) {
  if (typeof msg === 'string') return msg;
  if (msg instanceof Error) return msg.message;
  if (msg === undefined || msg === null) return '';
  try {
    return JSON.stringify(msg);
  } catch {
    return String(msg);
  }
}

/**
 * Return the part of a jsonLoad.php body that holds MAM's snatch summary.
 *
 * Since 2026-09-23 MAM nests the counter buckets (`sSat`, `unsat`, `seedHnr`,
 * `inactHnr`, `inactUnsat`, ...) and `connectable` under `snatch_summary`
 * instead of at the top level. The top level is used when that object is
 * absent, which covers the earlier layout.
 * @param {Record<string, any> | null | undefined} raw The `details.raw` object from /api/status.
 * @returns {Record<string, any>} The nested summary, or `raw` itself.
 */
export function snatchSummary(raw) {
  const summary = raw?.snatch_summary;
  return summary && typeof summary === 'object' ? summary : (raw ?? {});
}
