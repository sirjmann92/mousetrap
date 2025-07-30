"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDateTimePickerDefaultizedProps = useDateTimePickerDefaultizedProps;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _styles = require("@mui/material/styles");
var _usePickerAdapter = require("../hooks/usePickerAdapter");
var _DateTimePickerTabs = require("./DateTimePickerTabs");
var _DateTimePickerToolbar = require("./DateTimePickerToolbar");
var _views = require("../internals/utils/views");
var _dateTimeUtils = require("../internals/utils/date-time-utils");
var _useDateTimeManager = require("../managers/useDateTimeManager");
function useDateTimePickerDefaultizedProps(props, name) {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const themeProps = (0, _styles.useThemeProps)({
    props,
    name
  });
  const validationProps = (0, _useDateTimeManager.useApplyDefaultValuesToDateTimeValidationProps)(themeProps);
  const ampm = themeProps.ampm ?? adapter.is12HourCycleInCurrentLocale();
  const localeText = React.useMemo(() => {
    if (themeProps.localeText?.toolbarTitle == null) {
      return themeProps.localeText;
    }
    return (0, _extends2.default)({}, themeProps.localeText, {
      dateTimePickerToolbarTitle: themeProps.localeText.toolbarTitle
    });
  }, [themeProps.localeText]);
  const {
    openTo,
    views: defaultViews
  } = (0, _views.applyDefaultViewProps)({
    views: themeProps.views,
    openTo: themeProps.openTo,
    defaultViews: ['year', 'day', 'hours', 'minutes'],
    defaultOpenTo: 'day'
  });
  const {
    shouldRenderTimeInASingleColumn,
    thresholdToRenderTimeInASingleColumn,
    views,
    timeSteps
  } = (0, _dateTimeUtils.resolveTimeViewsResponse)({
    thresholdToRenderTimeInASingleColumn: themeProps.thresholdToRenderTimeInASingleColumn,
    ampm,
    timeSteps: themeProps.timeSteps,
    views: defaultViews
  });
  return (0, _extends2.default)({}, themeProps, validationProps, {
    timeSteps,
    openTo,
    shouldRenderTimeInASingleColumn,
    thresholdToRenderTimeInASingleColumn,
    views,
    ampm,
    localeText,
    orientation: themeProps.orientation ?? 'portrait',
    slots: (0, _extends2.default)({
      toolbar: _DateTimePickerToolbar.DateTimePickerToolbar,
      tabs: _DateTimePickerTabs.DateTimePickerTabs
    }, themeProps.slots),
    slotProps: (0, _extends2.default)({}, themeProps.slotProps, {
      toolbar: (0, _extends2.default)({
        ampm
      }, themeProps.slotProps?.toolbar)
    })
  });
}