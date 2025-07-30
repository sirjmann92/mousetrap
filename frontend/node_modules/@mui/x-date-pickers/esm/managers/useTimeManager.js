'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { singleItemFieldValueManager, singleItemValueManager } from "../internals/utils/valueManagers.js";
import { validateTime } from "../validation/index.js";
import { usePickerAdapter, usePickerTranslations } from "../hooks/index.js";
export function useTimeManager(parameters = {}) {
  const {
    enableAccessibleFieldDOMStructure = true,
    ampm
  } = parameters;
  return React.useMemo(() => ({
    valueType: 'time',
    validator: validateTime,
    internal_valueManager: singleItemValueManager,
    internal_fieldValueManager: singleItemFieldValueManager,
    internal_enableAccessibleFieldDOMStructure: enableAccessibleFieldDOMStructure,
    internal_useApplyDefaultValuesToFieldInternalProps: useApplyDefaultValuesToTimeFieldInternalProps,
    internal_useOpenPickerButtonAriaLabel: createUseOpenPickerButtonAriaLabel(ampm)
  }), [ampm, enableAccessibleFieldDOMStructure]);
}
function createUseOpenPickerButtonAriaLabel(ampm) {
  return function useOpenPickerButtonAriaLabel(value) {
    const adapter = usePickerAdapter();
    const translations = usePickerTranslations();
    return React.useMemo(() => {
      const formatKey = ampm ?? adapter.is12HourCycleInCurrentLocale() ? 'fullTime12h' : 'fullTime24h';
      const formattedValue = adapter.isValid(value) ? adapter.format(value, formatKey) : null;
      return translations.openTimePickerDialogue(formattedValue);
    }, [value, translations, adapter]);
  };
}
function useApplyDefaultValuesToTimeFieldInternalProps(internalProps) {
  const adapter = usePickerAdapter();
  const validationProps = useApplyDefaultValuesToTimeValidationProps(internalProps);
  const ampm = React.useMemo(() => internalProps.ampm ?? adapter.is12HourCycleInCurrentLocale(), [internalProps.ampm, adapter]);
  return React.useMemo(() => _extends({}, internalProps, validationProps, {
    format: internalProps.format ?? (ampm ? adapter.formats.fullTime12h : adapter.formats.fullTime24h)
  }), [internalProps, validationProps, ampm, adapter]);
}
export function useApplyDefaultValuesToTimeValidationProps(props) {
  return React.useMemo(() => ({
    disablePast: props.disablePast ?? false,
    disableFuture: props.disableFuture ?? false
  }), [props.disablePast, props.disableFuture]);
}