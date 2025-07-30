interface UseParsedFormatParameters {
  /**
   * Format to parse.
   * @default the format provided by the Picker.
   */
  format?: string;
}
/**
 * Returns the parsed format to be rendered in the field when there is no value or in other parts of the Picker.
 * This format is localized (for example `AAAA` for the year with the French locale) and cannot be parsed by your date library.
 * @param {object} The parameters needed to build the placeholder.
 * @param {string} params.format Format to parse.
 * @returns
 */
export declare const useParsedFormat: (parameters?: UseParsedFormatParameters) => string;
export {};