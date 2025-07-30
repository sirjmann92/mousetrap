"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTimePickerDefaultizedProps = useTimePickerDefaultizedProps;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _styles = require("@mui/material/styles");
var _TimePickerToolbar = require("./TimePickerToolbar");
var _views = require("../internals/utils/views");
var _useTimeManager = require("../managers/useTimeManager");
var _usePickerAdapter = require("../hooks/usePickerAdapter");
function useTimePickerDefaultizedProps(props, name) {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const themeProps = (0, _styles.useThemeProps)({
    props,
    name
  });
  const validationProps = (0, _useTimeManager.useApplyDefaultValuesToTimeValidationProps)(themeProps);
  const ampm = themeProps.ampm ?? adapter.is12HourCycleInCurrentLocale();
  const localeText = React.useMemo(() => {
    if (themeProps.localeText?.toolbarTitle == null) {
      return themeProps.localeText;
    }
    return (0, _extends2.default)({}, themeProps.localeText, {
      timePickerToolbarTitle: themeProps.localeText.toolbarTitle
    });
  }, [themeProps.localeText]);
  return (0, _extends2.default)({}, themeProps, validationProps, {
    ampm,
    localeText
  }, (0, _views.applyDefaultViewProps)({
    views: themeProps.views,
    openTo: themeProps.openTo,
    defaultViews: ['hours', 'minutes'],
    defaultOpenTo: 'hours'
  }), {
    slots: (0, _extends2.default)({
      toolbar: _TimePickerToolbar.TimePickerToolbar
    }, themeProps.slots),
    slotProps: (0, _extends2.default)({}, themeProps.slotProps, {
      toolbar: (0, _extends2.default)({
        ampm,
        ampmInClock: themeProps.ampmInClock
      }, themeProps.slotProps?.toolbar)
    })
  });
}