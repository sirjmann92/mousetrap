import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["value", "referenceDate"];
import { areDatesEqual, getTodayDate, replaceInvalidDateByNull } from "./date-utils.js";
import { getDefaultReferenceDate } from "./getDefaultReferenceDate.js";
import { createDateStrForV7HiddenInputFromSections, createDateStrForV6InputFromSections } from "../hooks/useField/useField.utils.js";
export const singleItemValueManager = {
  emptyValue: null,
  getTodayValue: getTodayDate,
  getInitialReferenceValue: _ref => {
    let {
        value,
        referenceDate
      } = _ref,
      params = _objectWithoutPropertiesLoose(_ref, _excluded);
    if (params.adapter.isValid(value)) {
      return value;
    }
    if (referenceDate != null) {
      return referenceDate;
    }
    return getDefaultReferenceDate(params);
  },
  cleanValue: replaceInvalidDateByNull,
  areValuesEqual: areDatesEqual,
  isSameError: (a, b) => a === b,
  hasError: error => error != null,
  defaultErrorState: null,
  getTimezone: (adapter, value) => adapter.isValid(value) ? adapter.getTimezone(value) : null,
  setTimezone: (adapter, timezone, value) => value == null ? null : adapter.setTimezone(value, timezone)
};
export const singleItemFieldValueManager = {
  updateReferenceValue: (adapter, value, prevReferenceValue) => adapter.isValid(value) ? value : prevReferenceValue,
  getSectionsFromValue: (date, getSectionsFromDate) => getSectionsFromDate(date),
  getV7HiddenInputValueFromSections: createDateStrForV7HiddenInputFromSections,
  getV6InputValueFromSections: createDateStrForV6InputFromSections,
  parseValueStr: (valueStr, referenceValue, parseDate) => parseDate(valueStr.trim(), referenceValue),
  getDateFromSection: value => value,
  getDateSectionsFromValue: sections => sections,
  updateDateInValue: (value, activeSection, activeDate) => activeDate,
  clearDateSections: sections => sections.map(section => _extends({}, section, {
    value: ''
  }))
};