'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { applyDefaultDate } from "../internals/utils/date-utils.js";
import { singleItemFieldValueManager, singleItemValueManager } from "../internals/utils/valueManagers.js";
import { validateDateTime } from "../validation/index.js";
import { useDefaultDates } from "../internals/hooks/useUtils.js";
import { usePickerAdapter, usePickerTranslations } from "../hooks/index.js";
export function useDateTimeManager(parameters = {}) {
  const {
    enableAccessibleFieldDOMStructure = true
  } = parameters;
  return React.useMemo(() => ({
    valueType: 'date-time',
    validator: validateDateTime,
    internal_valueManager: singleItemValueManager,
    internal_fieldValueManager: singleItemFieldValueManager,
    internal_enableAccessibleFieldDOMStructure: enableAccessibleFieldDOMStructure,
    internal_useApplyDefaultValuesToFieldInternalProps: useApplyDefaultValuesToDateTimeFieldInternalProps,
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
function useApplyDefaultValuesToDateTimeFieldInternalProps(internalProps) {
  const adapter = usePickerAdapter();
  const validationProps = useApplyDefaultValuesToDateTimeValidationProps(internalProps);
  const ampm = React.useMemo(() => internalProps.ampm ?? adapter.is12HourCycleInCurrentLocale(), [internalProps.ampm, adapter]);
  return React.useMemo(() => _extends({}, internalProps, validationProps, {
    format: internalProps.format ?? (ampm ? adapter.formats.keyboardDateTime12h : adapter.formats.keyboardDateTime24h)
  }), [internalProps, validationProps, ampm, adapter]);
}
export function useApplyDefaultValuesToDateTimeValidationProps(props) {
  const adapter = usePickerAdapter();
  const defaultDates = useDefaultDates();
  return React.useMemo(() => ({
    disablePast: props.disablePast ?? false,
    disableFuture: props.disableFuture ?? false,
    // TODO: Explore if we can remove it from the public API
    disableIgnoringDatePartForTimeValidation: !!props.minDateTime || !!props.maxDateTime || !!props.disableFuture || !!props.disablePast,
    minDate: applyDefaultDate(adapter, props.minDateTime ?? props.minDate, defaultDates.minDate),
    maxDate: applyDefaultDate(adapter, props.maxDateTime ?? props.maxDate, defaultDates.maxDate),
    minTime: props.minDateTime ?? props.minTime,
    maxTime: props.maxDateTime ?? props.maxTime
  }), [props.minDateTime, props.maxDateTime, props.minTime, props.maxTime, props.minDate, props.maxDate, props.disableFuture, props.disablePast, adapter, defaultDates]);
}