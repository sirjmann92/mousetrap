"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TimePickerToolbar = TimePickerToolbar;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _PickersToolbarText = require("../internals/components/PickersToolbarText");
var _PickersToolbarButton = require("../internals/components/PickersToolbarButton");
var _PickersToolbar = require("../internals/components/PickersToolbar");
var _utils = require("../internals/utils/utils");
var _hooks = require("../hooks");
var _dateHelpersHooks = require("../internals/hooks/date-helpers-hooks");
var _timePickerToolbarClasses = require("./timePickerToolbarClasses");
var _dateUtils = require("../internals/utils/date-utils");
var _useToolbarOwnerState = require("../internals/hooks/useToolbarOwnerState");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["ampm", "ampmInClock", "className", "classes"];
const useUtilityClasses = (classes, ownerState) => {
  const {
    pickerOrientation,
    toolbarDirection
  } = ownerState;
  const slots = {
    root: ['root'],
    separator: ['separator'],
    hourMinuteLabel: ['hourMinuteLabel', pickerOrientation === 'landscape' && 'hourMinuteLabelLandscape', toolbarDirection === 'rtl' && 'hourMinuteLabelReverse'],
    ampmSelection: ['ampmSelection', pickerOrientation === 'landscape' && 'ampmLandscape'],
    ampmLabel: ['ampmLabel']
  };
  return (0, _composeClasses.default)(slots, _timePickerToolbarClasses.getTimePickerToolbarUtilityClass, classes);
};
const TimePickerToolbarRoot = (0, _styles.styled)(_PickersToolbar.PickersToolbar, {
  name: 'MuiTimePickerToolbar',
  slot: 'Root'
})({});
const TimePickerToolbarSeparator = (0, _styles.styled)(_PickersToolbarText.PickersToolbarText, {
  name: 'MuiTimePickerToolbar',
  slot: 'Separator'
})({
  outline: 0,
  margin: '0 4px 0 2px',
  cursor: 'default'
});
const TimePickerToolbarHourMinuteLabel = (0, _styles.styled)('div', {
  name: 'MuiTimePickerToolbar',
  slot: 'HourMinuteLabel',
  overridesResolver: (props, styles) => [{
    [`&.${_timePickerToolbarClasses.timePickerToolbarClasses.hourMinuteLabelLandscape}`]: styles.hourMinuteLabelLandscape,
    [`&.${_timePickerToolbarClasses.timePickerToolbarClasses.hourMinuteLabelReverse}`]: styles.hourMinuteLabelReverse
  }, styles.hourMinuteLabel]
})({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  variants: [{
    props: {
      toolbarDirection: 'rtl'
    },
    style: {
      flexDirection: 'row-reverse'
    }
  }, {
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      marginTop: 'auto'
    }
  }]
});
const TimePickerToolbarAmPmSelection = (0, _styles.styled)('div', {
  name: 'MuiTimePickerToolbar',
  slot: 'AmPmSelection',
  overridesResolver: (props, styles) => [{
    [`.${_timePickerToolbarClasses.timePickerToolbarClasses.ampmLabel}`]: styles.ampmLabel
  }, {
    [`&.${_timePickerToolbarClasses.timePickerToolbarClasses.ampmLandscape}`]: styles.ampmLandscape
  }, styles.ampmSelection]
})({
  display: 'flex',
  flexDirection: 'column',
  marginRight: 'auto',
  marginLeft: 12,
  [`& .${_timePickerToolbarClasses.timePickerToolbarClasses.ampmLabel}`]: {
    fontSize: 17
  },
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      margin: '4px 0 auto',
      flexDirection: 'row',
      justifyContent: 'space-around',
      flexBasis: '100%'
    }
  }]
});

/**
 * Demos:
 *
 * - [TimePicker](https://mui.com/x/react-date-pickers/time-picker/)
 * - [Custom components](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [TimePickerToolbar API](https://mui.com/x/api/date-pickers/time-picker-toolbar/)
 */
function TimePickerToolbar(inProps) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiTimePickerToolbar'
  });
  const {
      ampm,
      ampmInClock,
      className,
      classes: classesProp
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const adapter = (0, _hooks.usePickerAdapter)();
  const translations = (0, _hooks.usePickerTranslations)();
  const ownerState = (0, _useToolbarOwnerState.useToolbarOwnerState)();
  const classes = useUtilityClasses(classesProp, ownerState);
  const {
    value,
    setValue,
    disabled,
    readOnly,
    view,
    setView,
    views
  } = (0, _hooks.usePickerContext)();
  const showAmPmControl = Boolean(ampm && !ampmInClock && views.includes('hours'));
  const {
    meridiemMode,
    handleMeridiemChange
  } = (0, _dateHelpersHooks.useMeridiemMode)(value, ampm, newValue => setValue(newValue, {
    changeImportance: 'set'
  }));
  const formatSection = format => {
    if (!adapter.isValid(value)) {
      return '--';
    }
    return adapter.format(value, format);
  };
  const separator = /*#__PURE__*/(0, _jsxRuntime.jsx)(TimePickerToolbarSeparator, {
    tabIndex: -1,
    value: ":",
    variant: "h3",
    selected: false,
    className: classes.separator
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(TimePickerToolbarRoot, (0, _extends2.default)({
    landscapeDirection: "row",
    toolbarTitle: translations.timePickerToolbarTitle,
    ownerState: ownerState,
    className: (0, _clsx.default)(classes.root, className)
  }, other, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(TimePickerToolbarHourMinuteLabel, {
      className: classes.hourMinuteLabel,
      ownerState: ownerState,
      children: [(0, _utils.arrayIncludes)(views, 'hours') && /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        tabIndex: -1,
        variant: "h3",
        onClick: () => setView('hours'),
        selected: view === 'hours',
        value: formatSection(ampm ? 'hours12h' : 'hours24h')
      }), (0, _utils.arrayIncludes)(views, ['hours', 'minutes']) && separator, (0, _utils.arrayIncludes)(views, 'minutes') && /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        tabIndex: -1,
        variant: "h3",
        onClick: () => setView('minutes'),
        selected: view === 'minutes',
        value: formatSection('minutes')
      }), (0, _utils.arrayIncludes)(views, ['minutes', 'seconds']) && separator, (0, _utils.arrayIncludes)(views, 'seconds') && /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        variant: "h3",
        onClick: () => setView('seconds'),
        selected: view === 'seconds',
        value: formatSection('seconds')
      })]
    }), showAmPmControl && /*#__PURE__*/(0, _jsxRuntime.jsxs)(TimePickerToolbarAmPmSelection, {
      className: classes.ampmSelection,
      ownerState: ownerState,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        disableRipple: true,
        variant: "subtitle2",
        selected: meridiemMode === 'am',
        typographyClassName: classes.ampmLabel,
        value: (0, _dateUtils.formatMeridiem)(adapter, 'am'),
        onClick: readOnly ? undefined : () => handleMeridiemChange('am'),
        disabled: disabled
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        disableRipple: true,
        variant: "subtitle2",
        selected: meridiemMode === 'pm',
        typographyClassName: classes.ampmLabel,
        value: (0, _dateUtils.formatMeridiem)(adapter, 'pm'),
        onClick: readOnly ? undefined : () => handleMeridiemChange('pm'),
        disabled: disabled
      })]
    })]
  }));
}
process.env.NODE_ENV !== "production" ? TimePickerToolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  ampm: _propTypes.default.bool,
  ampmInClock: _propTypes.default.bool,
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