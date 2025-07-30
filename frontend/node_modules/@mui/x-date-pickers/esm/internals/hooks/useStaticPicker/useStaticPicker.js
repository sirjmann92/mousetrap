import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["props", "steps"];
import * as React from 'react';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import { usePicker } from "../usePicker/index.js";
import { PickerProvider } from "../../components/PickerProvider.js";
import { PickersLayout } from "../../../PickersLayout/index.js";
import { DIALOG_WIDTH } from "../../constants/dimensions.js";
import { mergeSx } from "../../utils/utils.js";
import { createNonRangePickerStepNavigation } from "../../utils/createNonRangePickerStepNavigation.js";
import { jsx as _jsx } from "react/jsx-runtime";
const PickerStaticLayout = styled(PickersLayout)(({
  theme
}) => ({
  overflow: 'hidden',
  minWidth: DIALOG_WIDTH,
  backgroundColor: (theme.vars || theme).palette.background.paper
}));

/**
 * Hook managing all the single-date static pickers:
 * - StaticDatePicker
 * - StaticDateTimePicker
 * - StaticTimePicker
 */
export const useStaticPicker = _ref => {
  let {
      props,
      steps
    } = _ref,
    pickerParams = _objectWithoutPropertiesLoose(_ref, _excluded);
  const {
    localeText,
    slots,
    slotProps,
    displayStaticWrapperAs,
    autoFocus
  } = props;
  const getStepNavigation = createNonRangePickerStepNavigation({
    steps
  });
  const {
    providerProps,
    renderCurrentView
  } = usePicker(_extends({}, pickerParams, {
    props,
    variant: displayStaticWrapperAs,
    autoFocusView: autoFocus ?? false,
    viewContainerRole: null,
    localeText,
    getStepNavigation
  }));
  const Layout = slots?.layout ?? PickerStaticLayout;
  const renderPicker = () => /*#__PURE__*/_jsx(PickerProvider, _extends({}, providerProps, {
    children: /*#__PURE__*/_jsx(Layout, _extends({}, slotProps?.layout, {
      slots: slots,
      slotProps: slotProps,
      sx: mergeSx(providerProps.contextValue.rootSx, slotProps?.layout?.sx),
      className: clsx(providerProps.contextValue.rootClassName, slotProps?.layout?.className),
      ref: providerProps.contextValue.rootRef,
      children: renderCurrentView()
    }))
  }));
  if (process.env.NODE_ENV !== "production") renderPicker.displayName = "renderPicker";
  return {
    renderPicker
  };
};