"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useSlotProps2 = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _PickersActionBar = require("../PickersActionBar");
var _pickersLayoutClasses = require("./pickersLayoutClasses");
var _PickersShortcuts = require("../PickersShortcuts");
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _hooks = require("../hooks");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["ownerState"];
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
  return (0, _composeClasses.default)(slots, _pickersLayoutClasses.getPickersLayoutUtilityClass, classes);
};
const usePickerLayout = props => {
  const {
    ownerState: pickerOwnerState,
    defaultActionBarActions
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const {
    view
  } = (0, _hooks.usePickerContext)();
  const isRtl = (0, _RtlProvider.useRtl)();
  const {
    children,
    slots,
    slotProps,
    classes: classesProp
  } = props;
  const ownerState = React.useMemo(() => (0, _extends2.default)({}, pickerOwnerState, {
    layoutDirection: isRtl ? 'rtl' : 'ltr'
  }), [pickerOwnerState, isRtl]);
  const classes = useUtilityClasses(classesProp, ownerState);

  // Action bar
  const ActionBar = slots?.actionBar ?? _PickersActionBar.PickersActionBar;
  const _useSlotProps = (0, _useSlotProps2.default)({
      elementType: ActionBar,
      externalSlotProps: slotProps?.actionBar,
      additionalProps: {
        actions: defaultActionBarActions
      },
      className: classes.actionBar,
      ownerState
    }),
    actionBarProps = (0, _objectWithoutPropertiesLoose2.default)(_useSlotProps, _excluded);
  const actionBar = /*#__PURE__*/(0, _jsxRuntime.jsx)(ActionBar, (0, _extends2.default)({}, actionBarProps));

  // Toolbar
  const Toolbar = slots?.toolbar;
  const toolbarProps = (0, _useSlotProps2.default)({
    elementType: Toolbar,
    externalSlotProps: slotProps?.toolbar,
    className: classes.toolbar,
    ownerState
  });
  const toolbar = toolbarHasView(toolbarProps) && !!Toolbar ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Toolbar, (0, _extends2.default)({}, toolbarProps)) : null;

  // Content
  const content = children;

  // Tabs
  const Tabs = slots?.tabs;
  const tabs = view && Tabs ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Tabs, (0, _extends2.default)({
    className: classes.tabs
  }, slotProps?.tabs)) : null;

  // Shortcuts
  const Shortcuts = slots?.shortcuts ?? _PickersShortcuts.PickersShortcuts;
  const shortcutsProps = (0, _useSlotProps2.default)({
    elementType: Shortcuts,
    externalSlotProps: slotProps?.shortcuts,
    className: classes.shortcuts,
    ownerState
  });
  const shortcuts = view && !!Shortcuts ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Shortcuts, (0, _extends2.default)({}, shortcutsProps)) : null;
  return {
    toolbar,
    content,
    tabs,
    actionBar,
    shortcuts,
    ownerState
  };
};
var _default = exports.default = usePickerLayout;