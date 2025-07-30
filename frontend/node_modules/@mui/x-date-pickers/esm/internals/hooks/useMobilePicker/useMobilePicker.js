import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["props", "steps"],
  _excluded2 = ["ownerState"];
import * as React from 'react';
import useSlotProps from '@mui/utils/useSlotProps';
import { PickersModalDialog } from "../../components/PickersModalDialog.js";
import { usePicker } from "../usePicker/index.js";
import { PickersLayout } from "../../../PickersLayout/index.js";
import { PickerProvider } from "../../components/PickerProvider.js";
import { PickerFieldUIContextProvider } from "../../components/PickerFieldUI.js";
import { createNonRangePickerStepNavigation } from "../../utils/createNonRangePickerStepNavigation.js";

/**
 * Hook managing all the single-date mobile pickers:
 * - MobileDatePicker
 * - MobileDateTimePicker
 * - MobileTimePicker
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const useMobilePicker = _ref => {
  let {
      props,
      steps
    } = _ref,
    pickerParams = _objectWithoutPropertiesLoose(_ref, _excluded);
  const {
    slots,
    slotProps: innerSlotProps,
    label,
    inputRef,
    localeText
  } = props;
  const getStepNavigation = createNonRangePickerStepNavigation({
    steps
  });
  const {
    providerProps,
    renderCurrentView,
    ownerState
  } = usePicker(_extends({}, pickerParams, {
    props,
    localeText,
    autoFocusView: true,
    viewContainerRole: 'dialog',
    variant: 'mobile',
    getStepNavigation
  }));
  const labelId = providerProps.privateContextValue.labelId;
  const isToolbarHidden = innerSlotProps?.toolbar?.hidden ?? false;
  const Field = slots.field;
  const _useSlotProps = useSlotProps({
      elementType: Field,
      externalSlotProps: innerSlotProps?.field,
      additionalProps: _extends({}, isToolbarHidden && {
        id: labelId
      }),
      ownerState
    }),
    fieldProps = _objectWithoutPropertiesLoose(_useSlotProps, _excluded2);
  const Layout = slots.layout ?? PickersLayout;
  let labelledById = labelId;
  if (isToolbarHidden) {
    if (label) {
      labelledById = `${labelId}-label`;
    } else {
      labelledById = undefined;
    }
  }
  const slotProps = _extends({}, innerSlotProps, {
    toolbar: _extends({}, innerSlotProps?.toolbar, {
      titleId: labelId
    }),
    mobilePaper: _extends({
      'aria-labelledby': labelledById
    }, innerSlotProps?.mobilePaper)
  });
  const renderPicker = () => /*#__PURE__*/_jsx(PickerProvider, _extends({}, providerProps, {
    children: /*#__PURE__*/_jsxs(PickerFieldUIContextProvider, {
      slots: slots,
      slotProps: slotProps,
      inputRef: inputRef,
      children: [/*#__PURE__*/_jsx(Field, _extends({}, fieldProps)), /*#__PURE__*/_jsx(PickersModalDialog, {
        slots: slots,
        slotProps: slotProps,
        children: /*#__PURE__*/_jsx(Layout, _extends({}, slotProps?.layout, {
          slots: slots,
          slotProps: slotProps,
          children: renderCurrentView()
        }))
      })]
    })
  }));
  if (process.env.NODE_ENV !== "production") renderPicker.displayName = "renderPicker";
  return {
    renderPicker
  };
};