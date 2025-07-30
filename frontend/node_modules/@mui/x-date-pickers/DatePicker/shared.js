"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDatePickerDefaultizedProps = useDatePickerDefaultizedProps;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _styles = require("@mui/material/styles");
var _views = require("../internals/utils/views");
var _DatePickerToolbar = require("./DatePickerToolbar");
var _useDateManager = require("../managers/useDateManager");
function useDatePickerDefaultizedProps(props, name) {
  const themeProps = (0, _styles.useThemeProps)({
    props,
    name
  });
  const validationProps = (0, _useDateManager.useApplyDefaultValuesToDateValidationProps)(themeProps);
  const localeText = React.useMemo(() => {
    if (themeProps.localeText?.toolbarTitle == null) {
      return themeProps.localeText;
    }
    return (0, _extends2.default)({}, themeProps.localeText, {
      datePickerToolbarTitle: themeProps.localeText.toolbarTitle
    });
  }, [themeProps.localeText]);
  return (0, _extends2.default)({}, themeProps, validationProps, {
    localeText
  }, (0, _views.applyDefaultViewProps)({
    views: themeProps.views,
    openTo: themeProps.openTo,
    defaultViews: ['year', 'day'],
    defaultOpenTo: 'day'
  }), {
    slots: (0, _extends2.default)({
      toolbar: _DatePickerToolbar.DatePickerToolbar
    }, themeProps.slots)
  });
}