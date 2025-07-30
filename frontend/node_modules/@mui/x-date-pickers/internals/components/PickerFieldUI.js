"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickerFieldUI = PickerFieldUI;
exports.PickerFieldUIContext = void 0;
exports.PickerFieldUIContextProvider = PickerFieldUIContextProvider;
exports.cleanFieldResponse = void 0;
exports.mergeSlotProps = mergeSlotProps;
exports.useFieldTextFieldProps = useFieldTextFieldProps;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _resolveComponentProps = _interopRequireDefault(require("@mui/utils/resolveComponentProps"));
var _TextField = _interopRequireDefault(require("@mui/material/TextField"));
var _IconButton = _interopRequireDefault(require("@mui/material/IconButton"));
var _InputAdornment = _interopRequireDefault(require("@mui/material/InputAdornment"));
var _useSlotProps5 = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _useFieldOwnerState = require("../hooks/useFieldOwnerState");
var _hooks = require("../../hooks");
var _icons = require("../../icons");
var _useNullablePickerContext = require("../hooks/useNullablePickerContext");
var _PickersTextField = require("../../PickersTextField");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["enableAccessibleFieldDOMStructure"],
  _excluded2 = ["InputProps", "readOnly", "onClear", "clearable", "clearButtonPosition", "openPickerButtonPosition", "openPickerAriaLabel"],
  _excluded3 = ["onPaste", "onKeyDown", "inputMode", "readOnly", "InputProps", "inputProps", "inputRef", "onClear", "clearable", "clearButtonPosition", "openPickerButtonPosition", "openPickerAriaLabel"],
  _excluded4 = ["ownerState"],
  _excluded5 = ["ownerState"],
  _excluded6 = ["ownerState"],
  _excluded7 = ["ownerState"],
  _excluded8 = ["InputProps", "inputProps"];
const cleanFieldResponse = _ref => {
  let {
      enableAccessibleFieldDOMStructure
    } = _ref,
    fieldResponse = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);
  if (enableAccessibleFieldDOMStructure) {
    const {
        InputProps,
        readOnly,
        onClear,
        clearable,
        clearButtonPosition,
        openPickerButtonPosition,
        openPickerAriaLabel
      } = fieldResponse,
      other = (0, _objectWithoutPropertiesLoose2.default)(fieldResponse, _excluded2);
    return {
      clearable,
      onClear,
      clearButtonPosition,
      openPickerButtonPosition,
      openPickerAriaLabel,
      textFieldProps: (0, _extends2.default)({}, other, {
        InputProps: (0, _extends2.default)({}, InputProps ?? {}, {
          readOnly
        })
      })
    };
  }
  const {
      onPaste,
      onKeyDown,
      inputMode,
      readOnly,
      InputProps,
      inputProps,
      inputRef,
      onClear,
      clearable,
      clearButtonPosition,
      openPickerButtonPosition,
      openPickerAriaLabel
    } = fieldResponse,
    other = (0, _objectWithoutPropertiesLoose2.default)(fieldResponse, _excluded3);
  return {
    clearable,
    onClear,
    clearButtonPosition,
    openPickerButtonPosition,
    openPickerAriaLabel,
    textFieldProps: (0, _extends2.default)({}, other, {
      InputProps: (0, _extends2.default)({}, InputProps ?? {}, {
        readOnly
      }),
      inputProps: (0, _extends2.default)({}, inputProps ?? {}, {
        inputMode,
        onPaste,
        onKeyDown,
        ref: inputRef
      })
    })
  };
};
exports.cleanFieldResponse = cleanFieldResponse;
const PickerFieldUIContext = exports.PickerFieldUIContext = /*#__PURE__*/React.createContext({
  slots: {},
  slotProps: {},
  inputRef: undefined
});

/**
 * Adds the button to open the Picker and the button to clear the value of the field.
 * @ignore - internal component.
 */
if (process.env.NODE_ENV !== "production") PickerFieldUIContext.displayName = "PickerFieldUIContext";
function PickerFieldUI(props) {
  const {
    slots,
    slotProps,
    fieldResponse,
    defaultOpenPickerIcon
  } = props;
  const translations = (0, _hooks.usePickerTranslations)();
  const pickerContext = (0, _useNullablePickerContext.useNullablePickerContext)();
  const pickerFieldUIContext = React.useContext(PickerFieldUIContext);
  const {
    textFieldProps,
    onClear,
    clearable,
    openPickerAriaLabel,
    clearButtonPosition: clearButtonPositionProp = 'end',
    openPickerButtonPosition: openPickerButtonPositionProp = 'end'
  } = cleanFieldResponse(fieldResponse);
  const ownerState = (0, _useFieldOwnerState.useFieldOwnerState)(textFieldProps);
  const handleClickOpeningButton = (0, _useEventCallback.default)(event => {
    event.preventDefault();
    pickerContext?.setOpen(prev => !prev);
  });
  const triggerStatus = pickerContext ? pickerContext.triggerStatus : 'hidden';
  const clearButtonPosition = clearable ? clearButtonPositionProp : null;
  const openPickerButtonPosition = triggerStatus !== 'hidden' ? openPickerButtonPositionProp : null;
  const TextField = slots?.textField ?? pickerFieldUIContext.slots.textField ?? (fieldResponse.enableAccessibleFieldDOMStructure === false ? _TextField.default : _PickersTextField.PickersTextField);
  const InputAdornment = slots?.inputAdornment ?? pickerFieldUIContext.slots.inputAdornment ?? _InputAdornment.default;
  const _useSlotProps = (0, _useSlotProps5.default)({
      elementType: InputAdornment,
      externalSlotProps: mergeSlotProps(pickerFieldUIContext.slotProps.inputAdornment, slotProps?.inputAdornment),
      additionalProps: {
        position: 'start'
      },
      ownerState: (0, _extends2.default)({}, ownerState, {
        position: 'start'
      })
    }),
    startInputAdornmentProps = (0, _objectWithoutPropertiesLoose2.default)(_useSlotProps, _excluded4);
  const _useSlotProps2 = (0, _useSlotProps5.default)({
      elementType: InputAdornment,
      externalSlotProps: slotProps?.inputAdornment,
      additionalProps: {
        position: 'end'
      },
      ownerState: (0, _extends2.default)({}, ownerState, {
        position: 'end'
      })
    }),
    endInputAdornmentProps = (0, _objectWithoutPropertiesLoose2.default)(_useSlotProps2, _excluded5);
  const OpenPickerButton = pickerFieldUIContext.slots.openPickerButton ?? _IconButton.default;
  // We don't want to forward the `ownerState` to the `<IconButton />` component, see mui/material-ui#34056
  const _useSlotProps3 = (0, _useSlotProps5.default)({
      elementType: OpenPickerButton,
      externalSlotProps: pickerFieldUIContext.slotProps.openPickerButton,
      additionalProps: {
        disabled: triggerStatus === 'disabled',
        onClick: handleClickOpeningButton,
        'aria-label': openPickerAriaLabel,
        edge:
        // open button is always rendered at the edge
        textFieldProps.variant !== 'standard' ? openPickerButtonPosition : false
      },
      ownerState
    }),
    openPickerButtonProps = (0, _objectWithoutPropertiesLoose2.default)(_useSlotProps3, _excluded6);
  const OpenPickerIcon = pickerFieldUIContext.slots.openPickerIcon ?? defaultOpenPickerIcon;
  const openPickerIconProps = (0, _useSlotProps5.default)({
    elementType: OpenPickerIcon,
    externalSlotProps: pickerFieldUIContext.slotProps.openPickerIcon,
    ownerState
  });
  const ClearButton = slots?.clearButton ?? pickerFieldUIContext.slots.clearButton ?? _IconButton.default;
  // We don't want to forward the `ownerState` to the `<IconButton />` component, see mui/material-ui#34056
  const _useSlotProps4 = (0, _useSlotProps5.default)({
      elementType: ClearButton,
      externalSlotProps: mergeSlotProps(pickerFieldUIContext.slotProps.clearButton, slotProps?.clearButton),
      className: 'clearButton',
      additionalProps: {
        title: translations.fieldClearLabel,
        tabIndex: -1,
        onClick: onClear,
        disabled: fieldResponse.disabled || fieldResponse.readOnly,
        edge:
        // clear button can only be at the edge if it's position differs from the open button
        textFieldProps.variant !== 'standard' && clearButtonPosition !== openPickerButtonPosition ? clearButtonPosition : false
      },
      ownerState
    }),
    clearButtonProps = (0, _objectWithoutPropertiesLoose2.default)(_useSlotProps4, _excluded7);
  const ClearIcon = slots?.clearIcon ?? pickerFieldUIContext.slots.clearIcon ?? _icons.ClearIcon;
  const clearIconProps = (0, _useSlotProps5.default)({
    elementType: ClearIcon,
    externalSlotProps: mergeSlotProps(pickerFieldUIContext.slotProps.clearIcon, slotProps?.clearIcon),
    additionalProps: {
      fontSize: 'small'
    },
    ownerState
  });
  textFieldProps.ref = (0, _useForkRef.default)(textFieldProps.ref, pickerContext?.rootRef);
  if (!textFieldProps.InputProps) {
    textFieldProps.InputProps = {};
  }
  if (pickerContext) {
    textFieldProps.InputProps.ref = pickerContext.triggerRef;
  }
  if (!textFieldProps.InputProps?.startAdornment && (clearButtonPosition === 'start' || openPickerButtonPosition === 'start')) {
    textFieldProps.InputProps.startAdornment = /*#__PURE__*/(0, _jsxRuntime.jsxs)(InputAdornment, (0, _extends2.default)({}, startInputAdornmentProps, {
      children: [openPickerButtonPosition === 'start' && /*#__PURE__*/(0, _jsxRuntime.jsx)(OpenPickerButton, (0, _extends2.default)({}, openPickerButtonProps, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(OpenPickerIcon, (0, _extends2.default)({}, openPickerIconProps))
      })), clearButtonPosition === 'start' && /*#__PURE__*/(0, _jsxRuntime.jsx)(ClearButton, (0, _extends2.default)({}, clearButtonProps, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(ClearIcon, (0, _extends2.default)({}, clearIconProps))
      }))]
    }));
  }
  if (!textFieldProps.InputProps?.endAdornment && (clearButtonPosition === 'end' || openPickerButtonPosition === 'end')) {
    textFieldProps.InputProps.endAdornment = /*#__PURE__*/(0, _jsxRuntime.jsxs)(InputAdornment, (0, _extends2.default)({}, endInputAdornmentProps, {
      children: [clearButtonPosition === 'end' && /*#__PURE__*/(0, _jsxRuntime.jsx)(ClearButton, (0, _extends2.default)({}, clearButtonProps, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(ClearIcon, (0, _extends2.default)({}, clearIconProps))
      })), openPickerButtonPosition === 'end' && /*#__PURE__*/(0, _jsxRuntime.jsx)(OpenPickerButton, (0, _extends2.default)({}, openPickerButtonProps, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(OpenPickerIcon, (0, _extends2.default)({}, openPickerIconProps))
      }))]
    }));
  }
  if (clearButtonPosition != null) {
    textFieldProps.sx = [{
      '& .clearButton': {
        opacity: 1
      },
      '@media (pointer: fine)': {
        '& .clearButton': {
          opacity: 0
        },
        '&:hover, &:focus-within': {
          '.clearButton': {
            opacity: 1
          }
        }
      }
    }, ...(Array.isArray(textFieldProps.sx) ? textFieldProps.sx : [textFieldProps.sx])];
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(TextField, (0, _extends2.default)({}, textFieldProps));
}
function mergeSlotProps(slotPropsA, slotPropsB) {
  if (!slotPropsA) {
    return slotPropsB;
  }
  if (!slotPropsB) {
    return slotPropsA;
  }
  return ownerState => {
    return (0, _extends2.default)({}, (0, _resolveComponentProps.default)(slotPropsB, ownerState), (0, _resolveComponentProps.default)(slotPropsA, ownerState));
  };
}

/**
 * The `textField` slot props cannot be handled inside `PickerFieldUI` because it would be a breaking change to not pass the enriched props to `useField`.
 * Once the non-accessible DOM structure will be removed, we will be able to remove the `textField` slot and clean this logic.
 */
function useFieldTextFieldProps(parameters) {
  const {
    ref,
    externalForwardedProps,
    slotProps
  } = parameters;
  const pickerFieldUIContext = React.useContext(PickerFieldUIContext);
  const pickerContext = (0, _useNullablePickerContext.useNullablePickerContext)();
  const ownerState = (0, _useFieldOwnerState.useFieldOwnerState)(externalForwardedProps);
  const {
      InputProps,
      inputProps
    } = externalForwardedProps,
    otherExternalForwardedProps = (0, _objectWithoutPropertiesLoose2.default)(externalForwardedProps, _excluded8);
  const textFieldProps = (0, _useSlotProps5.default)({
    elementType: _PickersTextField.PickersTextField,
    externalSlotProps: mergeSlotProps(pickerFieldUIContext.slotProps.textField, slotProps?.textField),
    externalForwardedProps: otherExternalForwardedProps,
    additionalProps: {
      ref,
      sx: pickerContext?.rootSx,
      label: pickerContext?.label,
      name: pickerContext?.name,
      className: pickerContext?.rootClassName,
      inputRef: pickerFieldUIContext.inputRef
    },
    ownerState
  });

  // TODO: Remove when mui/material-ui#35088 will be merged
  textFieldProps.inputProps = (0, _extends2.default)({}, inputProps, textFieldProps.inputProps);
  textFieldProps.InputProps = (0, _extends2.default)({}, InputProps, textFieldProps.InputProps);
  return textFieldProps;
}
function PickerFieldUIContextProvider(props) {
  const {
    slots = {},
    slotProps = {},
    inputRef,
    children
  } = props;
  const contextValue = React.useMemo(() => ({
    inputRef,
    slots: {
      openPickerButton: slots.openPickerButton,
      openPickerIcon: slots.openPickerIcon,
      textField: slots.textField,
      inputAdornment: slots.inputAdornment,
      clearIcon: slots.clearIcon,
      clearButton: slots.clearButton
    },
    slotProps: {
      openPickerButton: slotProps.openPickerButton,
      openPickerIcon: slotProps.openPickerIcon,
      textField: slotProps.textField,
      inputAdornment: slotProps.inputAdornment,
      clearIcon: slotProps.clearIcon,
      clearButton: slotProps.clearButton
    }
  }), [inputRef, slots.openPickerButton, slots.openPickerIcon, slots.textField, slots.inputAdornment, slots.clearIcon, slots.clearButton, slotProps.openPickerButton, slotProps.openPickerIcon, slotProps.textField, slotProps.inputAdornment, slotProps.clearIcon, slotProps.clearButton]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(PickerFieldUIContext.Provider, {
    value: contextValue,
    children: children
  });
}