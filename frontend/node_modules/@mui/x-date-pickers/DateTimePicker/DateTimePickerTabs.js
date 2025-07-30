"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateTimePickerTabs = void 0;
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _Tab = _interopRequireDefault(require("@mui/material/Tab"));
var _Tabs = _interopRequireWildcard(require("@mui/material/Tabs"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _icons = require("../icons");
var _usePickerTranslations = require("../hooks/usePickerTranslations");
var _dateTimePickerTabsClasses = require("./dateTimePickerTabsClasses");
var _dateUtils = require("../internals/utils/date-utils");
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _hooks = require("../hooks");
var _jsxRuntime = require("react/jsx-runtime");
const viewToTab = view => {
  if ((0, _dateUtils.isDatePickerView)(view)) {
    return 'date';
  }
  return 'time';
};
const tabToView = tab => {
  if (tab === 'date') {
    return 'day';
  }
  return 'hours';
};
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return (0, _composeClasses.default)(slots, _dateTimePickerTabsClasses.getDateTimePickerTabsUtilityClass, classes);
};
const DateTimePickerTabsRoot = (0, _styles.styled)(_Tabs.default, {
  name: 'MuiDateTimePickerTabs',
  slot: 'Root'
})(({
  theme
}) => ({
  boxShadow: `0 -1px 0 0 inset ${(theme.vars || theme).palette.divider}`,
  '&:last-child': {
    boxShadow: `0 1px 0 0 inset ${(theme.vars || theme).palette.divider}`,
    [`& .${_Tabs.tabsClasses.indicator}`]: {
      bottom: 'auto',
      top: 0
    }
  }
}));

/**
 * Demos:
 *
 * - [DateTimePicker](https://mui.com/x/react-date-pickers/date-time-picker/)
 * - [Custom slots and subcomponents](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [DateTimePickerTabs API](https://mui.com/x/api/date-pickers/date-time-picker-tabs/)
 */
const DateTimePickerTabs = exports.DateTimePickerTabs = function DateTimePickerTabs(inProps) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiDateTimePickerTabs'
  });
  const {
    dateIcon = /*#__PURE__*/(0, _jsxRuntime.jsx)(_icons.DateRangeIcon, {}),
    timeIcon = /*#__PURE__*/(0, _jsxRuntime.jsx)(_icons.TimeIcon, {}),
    hidden = typeof window === 'undefined' || window.innerHeight < 667,
    className,
    classes: classesProp,
    sx
  } = props;
  const translations = (0, _usePickerTranslations.usePickerTranslations)();
  const {
    ownerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const {
    view,
    setView
  } = (0, _hooks.usePickerContext)();
  const classes = useUtilityClasses(classesProp);
  const handleChange = (event, value) => {
    setView(tabToView(value));
  };
  if (hidden) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(DateTimePickerTabsRoot, {
    ownerState: ownerState,
    variant: "fullWidth",
    value: viewToTab(view),
    onChange: handleChange,
    className: (0, _clsx.default)(className, classes.root),
    sx: sx,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Tab.default, {
      value: "date",
      "aria-label": translations.dateTableLabel,
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
        children: dateIcon
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Tab.default, {
      value: "time",
      "aria-label": translations.timeTableLabel,
      icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
        children: timeIcon
      })
    })]
  });
};
if (process.env.NODE_ENV !== "production") DateTimePickerTabs.displayName = "DateTimePickerTabs";
process.env.NODE_ENV !== "production" ? DateTimePickerTabs.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  className: _propTypes.default.string,
  /**
   * Date tab icon.
   * @default DateRange
   */
  dateIcon: _propTypes.default.node,
  /**
   * Toggles visibility of the tabs allowing view switching.
   * @default `window.innerHeight < 667` for `DesktopDateTimePicker` and `MobileDateTimePicker`, `displayStaticWrapperAs === 'desktop'` for `StaticDateTimePicker`
   */
  hidden: _propTypes.default.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object]),
  /**
   * Time tab icon.
   * @default Time
   */
  timeIcon: _propTypes.default.node
} : void 0;