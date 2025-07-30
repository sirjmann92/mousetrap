'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { applyDefaultDate } from "../internals/utils/date-utils.js";
import { singleItemFieldValueManager, singleItemValueManager } from "../internals/utils/valueManagers.js";
import { validateDate } from "../validation/index.js";
import { useDefaultDates } from "../internals/hooks/useUtils.js";
import { usePickerAdapter, usePickerTranslations } from "../hooks/index.js";
export function useDateManager(parameters = {}) {
  const {
    enableAccessibleFieldDOMStructure = true
  } = parameters;
  return React.useMemo(() => ({
    valueType: 'date',
    validator: validateDate,
    internal_valueManager: singleItemValueManager,
    internal_fieldValueManager: singleItemFieldValueManager,
    internal_enableAccessibleFieldDOMStructure: enableAccessibleFieldDOMStructure,
    internal_useApplyDefaultValuesToFieldInternalProps: useApplyDefaultValuesToDateFieldInternalProps,
    internal_useOpenPickerButtonAriaLabel: useOpenPickerButtonAriaLabel
  }), [enableAccessibleFieldDOMStructure]);
}
function useOpenPickerButtonAriaLabel(value) {
  const adapter = usePickerAdapter();
  const translations = usePickerTranslations();
  return React.useMemo(() => {
    const formattedValue = adapter.isValid(value) ? adapter.format(value, 'fullDate') : null;
    return translations.openDatePickerDialogue(formattedValue);
  }, [value, translations, adapter]);
}
function useApplyDefaultValuesToDateFieldInternalProps(internalProps) {
  const adapter = usePickerAdapter();
  const validationProps = useApplyDefaultValuesToDateValidationProps(internalProps);
  return React.useMemo(() => _extends({}, internalProps, validationProps, {
    format: internalProps.format ?? adapter.formats.keyboardDate
  }), [internalProps, validationProps, adapter]);
}
export function useApplyDefaultValuesToDateValidationProps(props) {
  const adapter = usePickerAdapter();
  const defaultDates = useDefaultDates();
  return React.useMemo(() => ({
    disablePast: props.disablePast ?? false,
    disableFuture: props.disableFuture ?? false,
    minDate: applyDefaultDate(adapter, props.minDate, defaultDates.minDate),
    maxDate: applyDefaultDate(adapter, props.maxDate, defaultDates.maxDate)
  }), [props.minDate, props.maxDate, props.disableFuture, props.disablePast, adapter, defaultDates]);
}