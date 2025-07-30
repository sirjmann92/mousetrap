"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStaticPicker = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _styles = require("@mui/material/styles");
var _usePicker = require("../usePicker");
var _PickerProvider = require("../../components/PickerProvider");
var _PickersLayout = require("../../../PickersLayout");
var _dimensions = require("../../constants/dimensions");
var _utils = require("../../utils/utils");
var _createNonRangePickerStepNavigation = require("../../utils/createNonRangePickerStepNavigation");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["props", "steps"];
const PickerStaticLayout = (0, _styles.styled)(_PickersLayout.PickersLayout)(({
  theme
}) => ({
  overflow: 'hidden',
  minWidth: _dimensions.DIALOG_WIDTH,
  backgroundColor: (theme.vars || theme).palette.background.paper
}));

/**
 * Hook managing all the single-date static pickers:
 * - StaticDatePicker
 * - StaticDateTimePicker
 * - StaticTimePicker
 */
const useStaticPicker = _ref => {
  let {
      props,
      steps
    } = _ref,
    pickerParams = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);
  const {
    localeText,
    slots,
    slotProps,
    displayStaticWrapperAs,
    autoFocus
  } = props;
  const getStepNavigation = (0, _createNonRangePickerStepNavigation.createNonRangePickerStepNavigation)({
    steps
  });
  const {
    providerProps,
    renderCurrentView
  } = (0, _usePicker.usePicker)((0, _extends2.default)({}, pickerParams, {
    props,
    variant: displayStaticWrapperAs,
    autoFocusView: autoFocus ?? false,
    viewContainerRole: null,
    localeText,
    getStepNavigation
  }));
  const Layout = slots?.layout ?? PickerStaticLayout;
  const renderPicker = () => /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickerProvider.PickerProvider, (0, _extends2.default)({}, providerProps, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Layout, (0, _extends2.default)({}, slotProps?.layout, {
      slots: slots,
      slotProps: slotProps,
      sx: (0, _utils.mergeSx)(providerProps.contextValue.rootSx, slotProps?.layout?.sx),
      className: (0, _clsx.default)(providerProps.contextValue.rootClassName, slotProps?.layout?.className),
      ref: providerProps.contextValue.rootRef,
      children: renderCurrentView()
    }))
  }));
  if (process.env.NODE_ENV !== "production") renderPicker.displayName = "renderPicker";
  return {
    renderPicker
  };
};
exports.useStaticPicker = useStaticPicker;