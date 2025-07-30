"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useApplyDefaultValuesToDateValidationProps = useApplyDefaultValuesToDateValidationProps;
exports.useDateManager = useDateManager;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _dateUtils = require("../internals/utils/date-utils");
var _valueManagers = require("../internals/utils/valueManagers");
var _validation = require("../validation");
var _useUtils = require("../internals/hooks/useUtils");
var _hooks = require("../hooks");
function useDateManager(parameters = {}) {
  const {
    enableAccessibleFieldDOMStructure = true
  } = parameters;
  return React.useMemo(() => ({
    valueType: 'date',
    validator: _validation.validateDate,
    internal_valueManager: _valueManagers.singleItemValueManager,
    internal_fieldValueManager: _valueManagers.singleItemFieldValueManager,
    internal_enableAccessibleFieldDOMStructure: enableAccessibleFieldDOMStructure,
    internal_useApplyDefaultValuesToFieldInternalProps: useApplyDefaultValuesToDateFieldInternalProps,
    internal_useOpenPickerButtonAriaLabel: useOpenPickerButtonAriaLabel
  }), [enableAccessibleFieldDOMStructure]);
}
function useOpenPickerButtonAriaLabel(value) {
  const adapter = (0, _hooks.usePickerAdapter)();
  const translations = (0, _hooks.usePickerTranslations)();
  return React.useMemo(() => {
    const formattedValue = adapter.isValid(value) ? adapter.format(value, 'fullDate') : null;
    return translations.openDatePickerDialogue(formattedValue);
  }, [value, translations, adapter]);
}
function useApplyDefaultValuesToDateFieldInternalProps(internalProps) {
  const adapter = (0, _hooks.usePickerAdapter)();
  const validationProps = useApplyDefaultValuesToDateValidationProps(internalProps);
  return React.useMemo(() => (0, _extends2.default)({}, internalProps, validationProps, {
    format: internalProps.format ?? adapter.formats.keyboardDate
  }), [internalProps, validationProps, adapter]);
}
function useApplyDefaultValuesToDateValidationProps(props) {
  const adapter = (0, _hooks.usePickerAdapter)();
  const defaultDates = (0, _useUtils.useDefaultDates)();
  return React.useMemo(() => ({
    disablePast: props.disablePast ?? false,
    disableFuture: props.disableFuture ?? false,
    minDate: (0, _dateUtils.applyDefaultDate)(adapter, props.minDate, defaultDates.minDate),
    maxDate: (0, _dateUtils.applyDefaultDate)(adapter, props.maxDate, defaultDates.maxDate)
  }), [props.minDate, props.maxDate, props.disableFuture, props.disablePast, adapter, defaultDates]);
}