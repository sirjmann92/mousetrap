/**
 * Logs a message to the console on development mode. The warning will only be logged once.
 *
 * The message is the log's cache key. Two identical messages will only be logged once.
 *
 * This function is a no-op in production.
 *
 * @param message the message to log
 * @param gravity the gravity of the warning. Defaults to `'warning'`.
 * @returns
 */
export declare function warnOnce(message: string | string[], gravity?: 'warning' | 'error'): void;
export declare function clearWarningsCache(): void;