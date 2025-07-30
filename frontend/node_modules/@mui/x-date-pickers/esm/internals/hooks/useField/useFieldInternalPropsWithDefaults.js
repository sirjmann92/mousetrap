import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import { useNullablePickerContext } from "../useNullablePickerContext.js";
import { useNullableFieldPrivateContext } from "../useNullableFieldPrivateContext.js";

/**
 * Applies the default values to the field internal props.
 * This is a temporary hook that will be removed during a follow up when `useField` will receive the internal props without the defaults.
 * It is only here to allow the migration to be done in smaller steps.
 */
export function useFieldInternalPropsWithDefaults(parameters) {
  const {
    manager: {
      internal_useApplyDefaultValuesToFieldInternalProps: useApplyDefaultValuesToFieldInternalProps
    },
    internalProps,
    skipContextFieldRefAssignment
  } = parameters;
  const pickerContext = useNullablePickerContext();
  const fieldPrivateContext = useNullableFieldPrivateContext();
  const handleFieldRef = useForkRef(internalProps.unstableFieldRef, skipContextFieldRefAssignment ? null : fieldPrivateContext?.fieldRef);
  const setValue = pickerContext?.setValue;
  const handleChangeFromPicker = React.useCallback((newValue, ctx) => {
    return setValue?.(newValue, {
      validationError: ctx.validationError,
      shouldClose: false
    });
  }, [setValue]);
  const internalPropsWithDefaultsFromContext = React.useMemo(() => {
    // If one of the context is null,
    // Then the field is used as a standalone component and the other context will be null as well.
    if (fieldPrivateContext != null && pickerContext != null) {
      return _extends({
        value: pickerContext.value,
        onChange: handleChangeFromPicker,
        timezone: pickerContext.timezone,
        disabled: pickerContext.disabled,
        readOnly: pickerContext.readOnly,
        autoFocus: pickerContext.autoFocus && !pickerContext.open,
        focused: pickerContext.open ? true : undefined,
        format: pickerContext.fieldFormat,
        formatDensity: fieldPrivateContext.formatDensity,
        enableAccessibleFieldDOMStructure: fieldPrivateContext.enableAccessibleFieldDOMStructure,
        selectedSections: fieldPrivateContext.selectedSections,
        onSelectedSectionsChange: fieldPrivateContext.onSelectedSectionsChange,
        unstableFieldRef: handleFieldRef
      }, internalProps);
    }
    return internalProps;
  }, [pickerContext, fieldPrivateContext, internalProps, handleChangeFromPicker, handleFieldRef]);
  return useApplyDefaultValuesToFieldInternalProps(internalPropsWithDefaultsFromContext);
}