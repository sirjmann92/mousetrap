'use client';

import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
const _excluded = ["ownerState"];
import * as React from 'react';
import useSlotProps from '@mui/utils/useSlotProps';
import composeClasses from '@mui/utils/composeClasses';
import { useRtl } from '@mui/system/RtlProvider';
import { PickersActionBar } from "../PickersActionBar/index.js";
import { getPickersLayoutUtilityClass } from "./pickersLayoutClasses.js";
import { PickersShortcuts } from "../PickersShortcuts/index.js";
import { usePickerPrivateContext } from "../internals/hooks/usePickerPrivateContext.js";
import { usePickerContext } from "../hooks/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
function toolbarHasView(toolbarProps) {
  return toolbarProps.view !== null;
}
const useUtilityClasses = (classes, ownerState) => {
  const {
    pickerOrientation
  } = ownerState;
  const slots = {
    root: ['root', pickerOrientation === 'landscape' && 'landscape'],
    contentWrapper: ['contentWrapper'],
    toolbar: ['toolbar'],
    actionBar: ['actionBar'],
    tabs: ['tabs'],
    landscape: ['landscape'],
    shortcuts: ['shortcuts']
  };
  return composeClasses(slots, getPickersLayoutUtilityClass, classes);
};
const usePickerLayout = props => {
  const {
    ownerState: pickerOwnerState,
    defaultActionBarActions
  } = usePickerPrivateContext();
  const {
    view
  } = usePickerContext();
  const isRtl = useRtl();
  const {
    children,
    slots,
    slotProps,
    classes: classesProp
  } = props;
  const ownerState = React.useMemo(() => _extends({}, pickerOwnerState, {
    layoutDirection: isRtl ? 'rtl' : 'ltr'
  }), [pickerOwnerState, isRtl]);
  const classes = useUtilityClasses(classesProp, ownerState);

  // Action bar
  const ActionBar = slots?.actionBar ?? PickersActionBar;
  const _useSlotProps = useSlotProps({
      elementType: ActionBar,
      externalSlotProps: slotProps?.actionBar,
      additionalProps: {
        actions: defaultActionBarActions
      },
      className: classes.actionBar,
      ownerState
    }),
    actionBarProps = _objectWithoutPropertiesLoose(_useSlotProps, _excluded);
  const actionBar = /*#__PURE__*/_jsx(ActionBar, _extends({}, actionBarProps));

  // Toolbar
  const Toolbar = slots?.toolbar;
  const toolbarProps = useSlotProps({
    elementType: Toolbar,
    externalSlotProps: slotProps?.toolbar,
    className: classes.toolbar,
    ownerState
  });
  const toolbar = toolbarHasView(toolbarProps) && !!Toolbar ? /*#__PURE__*/_jsx(Toolbar, _extends({}, toolbarProps)) : null;

  // Content
  const content = children;

  // Tabs
  const Tabs = slots?.tabs;
  const tabs = view && Tabs ? /*#__PURE__*/_jsx(Tabs, _extends({
    className: classes.tabs
  }, slotProps?.tabs)) : null;

  // Shortcuts
  const Shortcuts = slots?.shortcuts ?? PickersShortcuts;
  const shortcutsProps = useSlotProps({
    elementType: Shortcuts,
    externalSlotProps: slotProps?.shortcuts,
    className: classes.shortcuts,
    ownerState
  });
  const shortcuts = view && !!Shortcuts ? /*#__PURE__*/_jsx(Shortcuts, _extends({}, shortcutsProps)) : null;
  return {
    toolbar,
    content,
    tabs,
    actionBar,
    shortcuts,
    ownerState
  };
};
export default usePickerLayout;