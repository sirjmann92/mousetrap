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
