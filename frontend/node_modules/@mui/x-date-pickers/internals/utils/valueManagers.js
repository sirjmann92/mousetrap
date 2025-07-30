"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.singleItemValueManager = exports.singleItemFieldValueManager = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _dateUtils = require("./date-utils");
var _getDefaultReferenceDate = require("./getDefaultReferenceDate");
var _useField = require("../hooks/useField/useField.utils");
const _excluded = ["value", "referenceDate"];
const singleItemValueManager = exports.singleItemValueManager = {
  emptyValue: null,
  getTodayValue: _dateUtils.getTodayDate,
  getInitialReferenceValue: _ref => {
    let {
        value,
        referenceDate
      } = _ref,
      params = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);
    if (params.adapter.isValid(value)) {
      return value;
    }
    if (referenceDate != null) {
      return referenceDate;
    }
    return (0, _getDefaultReferenceDate.getDefaultReferenceDate)(params);
  },
  cleanValue: _dateUtils.replaceInvalidDateByNull,
  areValuesEqual: _dateUtils.areDatesEqual,
  isSameError: (a, b) => a === b,
  hasError: error => error != null,
  defaultErrorState: null,
  getTimezone: (adapter, value) => adapter.isValid(value) ? adapter.getTimezone(value) : null,
  setTimezone: (adapter, timezone, value) => value == null ? null : adapter.setTimezone(value, timezone)
};
const singleItemFieldValueManager = exports.singleItemFieldValueManager = {
  updateReferenceValue: (adapter, value, prevReferenceValue) => adapter.isValid(value) ? value : prevReferenceValue,
  getSectionsFromValue: (date, getSectionsFromDate) => getSectionsFromDate(date),
  getV7HiddenInputValueFromSections: _useField.createDateStrForV7HiddenInputFromSections,
  getV6InputValueFromSections: _useField.createDateStrForV6InputFromSections,
  parseValueStr: (valueStr, referenceValue, parseDate) => parseDate(valueStr.trim(), referenceValue),
  getDateFromSection: value => value,
  getDateSectionsFromValue: sections => sections,
  updateDateInValue: (value, activeSection, activeDate) => activeDate,
  clearDateSections: sections => sections.map(section => (0, _extends2.default)({}, section, {
    value: ''
  }))
};