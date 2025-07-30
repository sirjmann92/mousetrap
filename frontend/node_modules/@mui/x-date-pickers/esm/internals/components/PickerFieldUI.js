'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["enableAccessibleFieldDOMStructure"],
  _excluded2 = ["InputProps", "readOnly", "onClear", "clearable", "clearButtonPosition", "openPickerButtonPosition", "openPickerAriaLabel"],
  _excluded3 = ["onPaste", "onKeyDown", "inputMode", "readOnly", "InputProps", "inputProps", "inputRef", "onClear", "clearable", "clearButtonPosition", "openPickerButtonPosition", "openPickerAriaLabel"],
  _excluded4 = ["ownerState"],
  _excluded5 = ["ownerState"],
  _excluded6 = ["ownerState"],
  _excluded7 = ["ownerState"],
  _excluded8 = ["InputProps", "inputProps"];
import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import resolveComponentProps from '@mui/utils/resolveComponentProps';
import MuiTextField from '@mui/material/TextField';
import MuiIconButton from '@mui/material/IconButton';
import MuiInputAdornment from '@mui/material/InputAdornment';
import useSlotProps from '@mui/utils/useSlotProps';
import { useFieldOwnerState } from "../hooks/useFieldOwnerState.js";
import { usePickerTranslations } from "../../hooks/index.js";
import { ClearIcon as MuiClearIcon } from "../../icons/index.js";
import { useNullablePickerContext } from "../hooks/useNullablePickerContext.js";
import { PickersTextField } from "../../PickersTextField/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const cleanFieldResponse = _ref => {
  let {
      enableAccessibleFieldDOMStructure
    } = _ref,
    fieldResponse = _objectWithoutPropertiesLoose(_ref, _excluded);
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
      other = _objectWithoutPropertiesLoose(fieldResponse, _excluded2);
    return {
      clearable,
      onClear,
      clearButtonPosition,
      openPickerButtonPosition,
      openPickerAriaLabel,
      textFieldProps: _extends({}, other, {
        InputProps: _extends({}, InputProps ?? {}, {
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
    other = _objectWithoutPropertiesLoose(fieldResponse, _excluded3);
  return {
    clearable,
    onClear,
    clearButtonPosition,
    openPickerButtonPosition,
    openPickerAriaLabel,
    textFieldProps: _extends({}, other, {
      InputProps: _extends({}, InputProps ?? {}, {
        readOnly
      }),
      inputProps: _extends({}, inputProps ?? {}, {
        inputMode,
        onPaste,
        onKeyDown,
        ref: inputRef
      })
    })
  };
};
export const PickerFieldUIContext = /*#__PURE__*/React.createContext({
  slots: {},
  slotProps: {},
  inputRef: undefined
});

/**
 * Adds the button to open the Picker and the button to clear the value of the field.
 * @ignore - internal component.
 */
if (process.env.NODE_ENV !== "production") PickerFieldUIContext.displayName = "PickerFieldUIContext";
export function PickerFieldUI(props) {
  const {
    slots,
    slotProps,
    fieldResponse,
    defaultOpenPickerIcon
  } = props;
  const translations = usePickerTranslations();
  const pickerContext = useNullablePickerContext();
  const pickerFieldUIContext = React.useContext(PickerFieldUIContext);
  const {
    textFieldProps,
    onClear,
    clearable,
    openPickerAriaLabel,
    clearButtonPosition: clearButtonPositionProp = 'end',
    openPickerButtonPosition: openPickerButtonPositionProp = 'end'
  } = cleanFieldResponse(fieldResponse);
  const ownerState = useFieldOwnerState(textFieldProps);
  const handleClickOpeningButton = useEventCallback(event => {
    event.preventDefault();
    pickerContext?.setOpen(prev => !prev);
  });
  const triggerStatus = pickerContext ? pickerContext.triggerStatus : 'hidden';
  const clearButtonPosition = clearable ? clearButtonPositionProp : null;
  const openPickerButtonPosition = triggerStatus !== 'hidden' ? openPickerButtonPositionProp : null;
  const TextField = slots?.textField ?? pickerFieldUIContext.slots.textField ?? (fieldResponse.enableAccessibleFieldDOMStructure === false ? MuiTextField : PickersTextField);
  const InputAdornment = slots?.inputAdornment ?? pickerFieldUIContext.slots.inputAdornment ?? MuiInputAdornment;
  const _useSlotProps = useSlotProps({
      elementType: InputAdornment,
      externalSlotProps: mergeSlotProps(pickerFieldUIContext.slotProps.inputAdornment, slotProps?.inputAdornment),
      additionalProps: {
        position: 'start'
      },
      ownerState: _extends({}, ownerState, {
        position: 'start'
      })
    }),
    startInputAdornmentProps = _objectWithoutPropertiesLoose(_useSlotProps, _excluded4);
  const _useSlotProps2 = useSlotProps({
      elementType: InputAdornment,
      externalSlotProps: slotProps?.inputAdornment,
      additionalProps: {
        position: 'end'
      },
      ownerState: _extends({}, ownerState, {
        position: 'end'
      })
    }),
    endInputAdornmentProps = _objectWithoutPropertiesLoose(_useSlotProps2, _excluded5);
  const OpenPickerButton = pickerFieldUIContext.slots.openPickerButton ?? MuiIconButton;
  // We don't want to forward the `ownerState` to the `<IconButton />` component, see mui/material-ui#34056
  const _useSlotProps3 = useSlotProps({
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
    openPickerButtonProps = _objectWithoutPropertiesLoose(_useSlotProps3, _excluded6);
  const OpenPickerIcon = pickerFieldUIContext.slots.openPickerIcon ?? defaultOpenPickerIcon;
  const openPickerIconProps = useSlotProps({
    elementType: OpenPickerIcon,
    externalSlotProps: pickerFieldUIContext.slotProps.openPickerIcon,
    ownerState
  });
  const ClearButton = slots?.clearButton ?? pickerFieldUIContext.slots.clearButton ?? MuiIconButton;
  // We don't want to forward the `ownerState` to the `<IconButton />` component, see mui/material-ui#34056
  const _useSlotProps4 = useSlotProps({
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
    clearButtonProps = _objectWithoutPropertiesLoose(_useSlotProps4, _excluded7);
  const ClearIcon = slots?.clearIcon ?? pickerFieldUIContext.slots.clearIcon ?? MuiClearIcon;
  const clearIconProps = useSlotProps({
    elementType: ClearIcon,
    externalSlotProps: mergeSlotProps(pickerFieldUIContext.slotProps.clearIcon, slotProps?.clearIcon),
    additionalProps: {
      fontSize: 'small'
    },
    ownerState
  });
  textFieldProps.ref = useForkRef(textFieldProps.ref, pickerContext?.rootRef);
  if (!textFieldProps.InputProps) {
    textFieldProps.InputProps = {};
  }
  if (pickerContext) {
    textFieldProps.InputProps.ref = pickerContext.triggerRef;
  }
  if (!textFieldProps.InputProps?.startAdornment && (clearButtonPosition === 'start' || openPickerButtonPosition === 'start')) {
    textFieldProps.InputProps.startAdornment = /*#__PURE__*/_jsxs(InputAdornment, _extends({}, startInputAdornmentProps, {
      children: [openPickerButtonPosition === 'start' && /*#__PURE__*/_jsx(OpenPickerButton, _extends({}, openPickerButtonProps, {
        children: /*#__PURE__*/_jsx(OpenPickerIcon, _extends({}, openPickerIconProps))
      })), clearButtonPosition === 'start' && /*#__PURE__*/_jsx(ClearButton, _extends({}, clearButtonProps, {
        children: /*#__PURE__*/_jsx(ClearIcon, _extends({}, clearIconProps))
      }))]
    }));
  }
  if (!textFieldProps.InputProps?.endAdornment && (clearButtonPosition === 'end' || openPickerButtonPosition === 'end')) {
    textFieldProps.InputProps.endAdornment = /*#__PURE__*/_jsxs(InputAdornment, _extends({}, endInputAdornmentProps, {
      children: [clearButtonPosition === 'end' && /*#__PURE__*/_jsx(ClearButton, _extends({}, clearButtonProps, {
        children: /*#__PURE__*/_jsx(ClearIcon, _extends({}, clearIconProps))
      })), openPickerButtonPosition === 'end' && /*#__PURE__*/_jsx(OpenPickerButton, _extends({}, openPickerButtonProps, {
        children: /*#__PURE__*/_jsx(OpenPickerIcon, _extends({}, openPickerIconProps))
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
  return /*#__PURE__*/_jsx(TextField, _extends({}, textFieldProps));
}
export function mergeSlotProps(slotPropsA, slotPropsB) {
  if (!slotPropsA) {
    return slotPropsB;
  }
  if (!slotPropsB) {
    return slotPropsA;
  }
  return ownerState => {
    return _extends({}, resolveComponentProps(slotPropsB, ownerState), resolveComponentProps(slotPropsA, ownerState));
  };
}

/**
 * The `textField` slot props cannot be handled inside `PickerFieldUI` because it would be a breaking change to not pass the enriched props to `useField`.
 * Once the non-accessible DOM structure will be removed, we will be able to remove the `textField` slot and clean this logic.
 */
export function useFieldTextFieldProps(parameters) {
  const {
    ref,
    externalForwardedProps,
    slotProps
  } = parameters;
  const pickerFieldUIContext = React.useContext(PickerFieldUIContext);
  const pickerContext = useNullablePickerContext();
  const ownerState = useFieldOwnerState(externalForwardedProps);
  const {
      InputProps,
      inputProps
    } = externalForwardedProps,
    otherExternalForwardedProps = _objectWithoutPropertiesLoose(externalForwardedProps, _excluded8);
  const textFieldProps = useSlotProps({
    elementType: PickersTextField,
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
  textFieldProps.inputProps = _extends({}, inputProps, textFieldProps.inputProps);
  textFieldProps.InputProps = _extends({}, InputProps, textFieldProps.InputProps);
  return textFieldProps;
}
export function PickerFieldUIContextProvider(props) {
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
  return /*#__PURE__*/_jsx(PickerFieldUIContext.Provider, {
    value: contextValue,
    children: children
  });
}