"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useMobilePicker = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _useSlotProps2 = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _PickersModalDialog = require("../../components/PickersModalDialog");
var _usePicker = require("../usePicker");
var _PickersLayout = require("../../../PickersLayout");
var _PickerProvider = require("../../components/PickerProvider");
var _PickerFieldUI = require("../../components/PickerFieldUI");
var _createNonRangePickerStepNavigation = require("../../utils/createNonRangePickerStepNavigation");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["props", "steps"],
  _excluded2 = ["ownerState"];
/**
 * Hook managing all the single-date mobile pickers:
 * - MobileDatePicker
 * - MobileDateTimePicker
 * - MobileTimePicker
 */
const useMobilePicker = _ref => {
  let {
      props,
      steps
    } = _ref,
    pickerParams = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);
  const {
    slots,
    slotProps: innerSlotProps,
    label,
    inputRef,
    localeText
  } = props;
  const getStepNavigation = (0, _createNonRangePickerStepNavigation.createNonRangePickerStepNavigation)({
    steps
  });
  const {
    providerProps,
    renderCurrentView,
    ownerState
  } = (0, _usePicker.usePicker)((0, _extends2.default)({}, pickerParams, {
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
  const _useSlotProps = (0, _useSlotProps2.default)({
      elementType: Field,
      externalSlotProps: innerSlotProps?.field,
      additionalProps: (0, _extends2.default)({}, isToolbarHidden && {
        id: labelId
      }),
      ownerState
    }),
    fieldProps = (0, _objectWithoutPropertiesLoose2.default)(_useSlotProps, _excluded2);
  const Layout = slots.layout ?? _PickersLayout.PickersLayout;
  let labelledById = labelId;
  if (isToolbarHidden) {
    if (label) {
      labelledById = `${labelId}-label`;
    } else {
      labelledById = undefined;
    }
  }
  const slotProps = (0, _extends2.default)({}, innerSlotProps, {
    toolbar: (0, _extends2.default)({}, innerSlotProps?.toolbar, {
      titleId: labelId
    }),
    mobilePaper: (0, _extends2.default)({
      'aria-labelledby': labelledById
    }, innerSlotProps?.mobilePaper)
  });
  const renderPicker = () => /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickerProvider.PickerProvider, (0, _extends2.default)({}, providerProps, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_PickerFieldUI.PickerFieldUIContextProvider, {
      slots: slots,
      slotProps: slotProps,
      inputRef: inputRef,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Field, (0, _extends2.default)({}, fieldProps)), /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersModalDialog.PickersModalDialog, {
        slots: slots,
        slotProps: slotProps,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Layout, (0, _extends2.default)({}, slotProps?.layout, {
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
exports.useMobilePicker = useMobilePicker;