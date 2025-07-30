"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useParsedFormat = void 0;
var React = _interopRequireWildcard(require("react"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _usePickerAdapter = require("./usePickerAdapter");
var _buildSectionsFromFormat = require("../internals/hooks/useField/buildSectionsFromFormat");
var _useField = require("../internals/hooks/useField/useField.utils");
var _usePickerTranslations = require("./usePickerTranslations");
var _useNullablePickerContext = require("../internals/hooks/useNullablePickerContext");
/**
 * Returns the parsed format to be rendered in the field when there is no value or in other parts of the Picker.
 * This format is localized (for example `AAAA` for the year with the French locale) and cannot be parsed by your date library.
 * @param {object} The parameters needed to build the placeholder.
 * @param {string} params.format Format to parse.
 * @returns
 */
const useParsedFormat = (parameters = {}) => {
  const pickerContext = (0, _useNullablePickerContext.useNullablePickerContext)();
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const isRtl = (0, _RtlProvider.useRtl)();
  const translations = (0, _usePickerTranslations.usePickerTranslations)();
  const localizedDigits = React.useMemo(() => (0, _useField.getLocalizedDigits)(adapter), [adapter]);
  const {
    format = pickerContext?.fieldFormat ?? adapter.formats.fullDate
  } = parameters;
  return React.useMemo(() => {
    const sections = (0, _buildSectionsFromFormat.buildSectionsFromFormat)({
      adapter,
      format,
      formatDensity: 'dense',
      isRtl,
      shouldRespectLeadingZeros: true,
      localeText: translations,
      localizedDigits,
      date: null,
      // TODO v9: Make sure we still don't reverse in `buildSectionsFromFormat` when using `useParsedFormat`.
      enableAccessibleFieldDOMStructure: false
    });
    return sections.map(section => `${section.startSeparator}${section.placeholder}${section.endSeparator}`).join('');
  }, [adapter, isRtl, translations, localizedDigits, format]);
};
exports.useParsedFormat = useParsedFormat;