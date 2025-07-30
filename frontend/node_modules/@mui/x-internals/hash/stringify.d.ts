/**
 * A JSON.stringify that handles circular references safely.
 * Fixes: https://github.com/mui/mui-x/issues/17521
 * Source: https://www.30secondsofcode.org/js/s/stringify-circular-json/
 */
export declare function stringify(input: object | string | number | null): string;