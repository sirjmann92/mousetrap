"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFieldInternalPropsWithDefaults = useFieldInternalPropsWithDefaults;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useNullablePickerContext = require("../useNullablePickerContext");
var _useNullableFieldPrivateContext = require("../useNullableFieldPrivateContext");
/**
 * Applies the default values to the field internal props.
 * This is a temporary hook that will be removed during a follow up when `useField` will receive the internal props without the defaults.
 * It is only here to allow the migration to be done in smaller steps.
 */
function useFieldInternalPropsWithDefaults(parameters) {
  const {
    manager: {
      internal_useApplyDefaultValuesToFieldInternalProps: useApplyDefaultValuesToFieldInternalProps
    },
    internalProps,
    skipContextFieldRefAssignment
  } = parameters;
  const pickerContext = (0, _useNullablePickerContext.useNullablePickerContext)();
  const fieldPrivateContext = (0, _useNullableFieldPrivateContext.useNullableFieldPrivateContext)();
  const handleFieldRef = (0, _useForkRef.default)(internalProps.unstableFieldRef, skipContextFieldRefAssignment ? null : fieldPrivateContext?.fieldRef);
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
      return (0, _extends2.default)({
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