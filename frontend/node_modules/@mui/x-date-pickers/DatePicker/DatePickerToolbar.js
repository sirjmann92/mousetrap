"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatePickerToolbar = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _Typography = _interopRequireDefault(require("@mui/material/Typography"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _PickersToolbar = require("../internals/components/PickersToolbar");
var _hooks = require("../hooks");
var _datePickerToolbarClasses = require("./datePickerToolbarClasses");
var _dateUtils = require("../internals/utils/date-utils");
var _useToolbarOwnerState = require("../internals/hooks/useToolbarOwnerState");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["toolbarFormat", "toolbarPlaceholder", "className", "classes"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    title: ['title']
  };
  return (0, _composeClasses.default)(slots, _datePickerToolbarClasses.getDatePickerToolbarUtilityClass, classes);
};
const DatePickerToolbarRoot = (0, _styles.styled)(_PickersToolbar.PickersToolbar, {
  name: 'MuiDatePickerToolbar',
  slot: 'Root'
})({});
const DatePickerToolbarTitle = (0, _styles.styled)(_Typography.default, {
  name: 'MuiDatePickerToolbar',
  slot: 'Title'
})({
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      margin: 'auto 16px auto auto'
    }
  }]
});
/**
 * Demos:
 *
 * - [DatePicker](https://mui.com/x/react-date-pickers/date-picker/)
 * - [Custom components](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [DatePickerToolbar API](https://mui.com/x/api/date-pickers/date-picker-toolbar/)
 */
const DatePickerToolbar = exports.DatePickerToolbar = /*#__PURE__*/React.forwardRef(function DatePickerToolbar(inProps, ref) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiDatePickerToolbar'
  });
  const {
      toolbarFormat,
      toolbarPlaceholder = '––',
      className,
      classes: classesProp
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const adapter = (0, _hooks.usePickerAdapter)();
  const {
    value,
    views,
    orientation
  } = (0, _hooks.usePickerContext)();
  const translations = (0, _hooks.usePickerTranslations)();
  const ownerState = (0, _useToolbarOwnerState.useToolbarOwnerState)();
  const classes = useUtilityClasses(classesProp);
  const dateText = React.useMemo(() => {
    if (!adapter.isValid(value)) {
      return toolbarPlaceholder;
    }
    const formatFromViews = (0, _dateUtils.resolveDateFormat)(adapter, {
      format: toolbarFormat,
      views
    }, true);
    return adapter.formatByString(value, formatFromViews);
  }, [value, toolbarFormat, toolbarPlaceholder, adapter, views]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(DatePickerToolbarRoot, (0, _extends2.default)({
    ref: ref,
    toolbarTitle: translations.datePickerToolbarTitle,
    className: (0, _clsx.default)(classes.root, className)
  }, other, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DatePickerToolbarTitle, {
      variant: "h4",
      align: orientation === 'landscape' ? 'left' : 'center',
      ownerState: ownerState,
      className: classes.title,
      children: dateText
    })
  }));
});
if (process.env.NODE_ENV !== "production") DatePickerToolbar.displayName = "DatePickerToolbar";
process.env.NODE_ENV !== "production" ? DatePickerToolbar.propTypes = {
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
   * If `true`, show the toolbar even in desktop mode.
   * @default `true` for Desktop, `false` for Mobile.
   */
  hidden: _propTypes.default.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object]),
  titleId: _propTypes.default.string,
  /**
   * Toolbar date format.
   */
  toolbarFormat: _propTypes.default.string,
  /**
   * Toolbar value placeholder—it is displayed when the value is empty.
   * @default "––"
   */
  toolbarPlaceholder: _propTypes.default.node
} : void 0;