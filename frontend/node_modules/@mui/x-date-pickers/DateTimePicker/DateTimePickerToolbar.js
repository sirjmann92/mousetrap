"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateTimePickerToolbar = DateTimePickerToolbar;
exports.DateTimePickerToolbarOverrideContext = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _createStyled = require("@mui/system/createStyled");
var _PickersToolbarText = require("../internals/components/PickersToolbarText");
var _PickersToolbar = require("../internals/components/PickersToolbar");
var _PickersToolbarButton = require("../internals/components/PickersToolbarButton");
var _hooks = require("../hooks");
var _dateTimePickerToolbarClasses = require("./dateTimePickerToolbarClasses");
var _dateHelpersHooks = require("../internals/hooks/date-helpers-hooks");
var _dimensions = require("../internals/constants/dimensions");
var _dateUtils = require("../internals/utils/date-utils");
var _pickersToolbarTextClasses = require("../internals/components/pickersToolbarTextClasses");
var _pickersToolbarClasses = require("../internals/components/pickersToolbarClasses");
var _usePickerContext = require("../hooks/usePickerContext");
var _useToolbarOwnerState = require("../internals/hooks/useToolbarOwnerState");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["ampm", "ampmInClock", "toolbarFormat", "toolbarPlaceholder", "toolbarTitle", "className", "classes"];
const useUtilityClasses = (classes, ownerState) => {
  const {
    pickerOrientation,
    toolbarDirection
  } = ownerState;
  const slots = {
    root: ['root'],
    dateContainer: ['dateContainer'],
    timeContainer: ['timeContainer', toolbarDirection === 'rtl' && 'timeLabelReverse'],
    timeDigitsContainer: ['timeDigitsContainer', toolbarDirection === 'rtl' && 'timeLabelReverse'],
    separator: ['separator'],
    ampmSelection: ['ampmSelection', pickerOrientation === 'landscape' && 'ampmLandscape'],
    ampmLabel: ['ampmLabel']
  };
  return (0, _composeClasses.default)(slots, _dateTimePickerToolbarClasses.getDateTimePickerToolbarUtilityClass, classes);
};
const DateTimePickerToolbarRoot = (0, _styles.styled)(_PickersToolbar.PickersToolbar, {
  name: 'MuiDateTimePickerToolbar',
  slot: 'Root',
  shouldForwardProp: prop => (0, _createStyled.shouldForwardProp)(prop) && prop !== 'toolbarVariant'
})(({
  theme
}) => ({
  paddingLeft: 16,
  paddingRight: 16,
  justifyContent: 'space-around',
  position: 'relative',
  variants: [{
    props: {
      toolbarVariant: 'desktop'
    },
    style: {
      borderBottom: `1px solid ${(theme.vars || theme).palette.divider}`,
      [`& .${_pickersToolbarClasses.pickersToolbarClasses.content} .${_pickersToolbarTextClasses.pickersToolbarTextClasses.root}[data-selected]`]: {
        color: (theme.vars || theme).palette.primary.main,
        fontWeight: theme.typography.fontWeightBold
      }
    }
  }, {
    props: {
      toolbarVariant: 'desktop',
      pickerOrientation: 'landscape'
    },
    style: {
      borderRight: `1px solid ${(theme.vars || theme).palette.divider}`
    }
  }, {
    props: {
      toolbarVariant: 'desktop',
      pickerOrientation: 'portrait'
    },
    style: {
      paddingLeft: 24,
      paddingRight: 0
    }
  }]
}));
const DateTimePickerToolbarDateContainer = (0, _styles.styled)('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'DateContainer'
})({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
});
const DateTimePickerToolbarTimeContainer = (0, _styles.styled)('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'TimeContainer',
  shouldForwardProp: prop => (0, _createStyled.shouldForwardProp)(prop) && prop !== 'toolbarVariant'
})({
  display: 'flex',
  flexDirection: 'row',
  variants: [{
    props: {
      toolbarDirection: 'rtl'
    },
    style: {
      flexDirection: 'row-reverse'
    }
  }, {
    props: {
      toolbarVariant: 'desktop',
      pickerOrientation: 'portrait'
    },
    style: {
      gap: 9,
      marginRight: 4,
      alignSelf: 'flex-end'
    }
  }, {
    props: ({
      pickerOrientation,
      toolbarVariant
    }) => pickerOrientation === 'landscape' && toolbarVariant !== 'desktop',
    style: {
      flexDirection: 'column'
    }
  }, {
    props: ({
      pickerOrientation,
      toolbarVariant,
      toolbarDirection
    }) => pickerOrientation === 'landscape' && toolbarVariant !== 'desktop' && toolbarDirection === 'rtl',
    style: {
      flexDirection: 'column-reverse'
    }
  }]
});
const DateTimePickerToolbarTimeDigitsContainer = (0, _styles.styled)('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'TimeDigitsContainer',
  shouldForwardProp: prop => (0, _createStyled.shouldForwardProp)(prop) && prop !== 'toolbarVariant'
})({
  display: 'flex',
  variants: [{
    props: {
      toolbarDirection: 'rtl'
    },
    style: {
      flexDirection: 'row-reverse'
    }
  }, {
    props: {
      toolbarVariant: 'desktop'
    },
    style: {
      gap: 1.5
    }
  }]
});
const DateTimePickerToolbarSeparator = (0, _styles.styled)(_PickersToolbarText.PickersToolbarText, {
  name: 'MuiDateTimePickerToolbar',
  slot: 'Separator',
  shouldForwardProp: prop => (0, _createStyled.shouldForwardProp)(prop) && prop !== 'toolbarVariant'
})({
  margin: '0 4px 0 2px',
  cursor: 'default',
  variants: [{
    props: {
      toolbarVariant: 'desktop'
    },
    style: {
      margin: 0
    }
  }]
});

// Taken from TimePickerToolbar
const DateTimePickerToolbarAmPmSelection = (0, _styles.styled)('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'AmPmSelection',
  overridesResolver: (props, styles) => [{
    [`.${_dateTimePickerToolbarClasses.dateTimePickerToolbarClasses.ampmLabel}`]: styles.ampmLabel
  }, {
    [`&.${_dateTimePickerToolbarClasses.dateTimePickerToolbarClasses.ampmLandscape}`]: styles.ampmLandscape
  }, styles.ampmSelection]
})({
  display: 'flex',
  flexDirection: 'column',
  marginRight: 'auto',
  marginLeft: 12,
  [`& .${_dateTimePickerToolbarClasses.dateTimePickerToolbarClasses.ampmLabel}`]: {
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
      width: '100%'
    }
  }]
});

/**
 * If `forceDesktopVariant` is set to `true`, the toolbar will always be rendered in the desktop mode.
 * If `onViewChange` is defined, the toolbar will call it instead of calling the default handler from `usePickerContext`.
 * This is used by the Date Time Range Picker Toolbar.
 */
const DateTimePickerToolbarOverrideContext = exports.DateTimePickerToolbarOverrideContext = /*#__PURE__*/React.createContext(null);

/**
 * Demos:
 *
 * - [DateTimePicker](https://mui.com/x/react-date-pickers/date-time-picker/)
 * - [Custom components](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [DateTimePickerToolbar API](https://mui.com/x/api/date-pickers/date-time-picker-toolbar/)
 */
if (process.env.NODE_ENV !== "production") DateTimePickerToolbarOverrideContext.displayName = "DateTimePickerToolbarOverrideContext";
function DateTimePickerToolbar(inProps) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiDateTimePickerToolbar'
  });
  const {
      ampm,
      ampmInClock,
      toolbarFormat,
      toolbarPlaceholder = '––',
      toolbarTitle: inToolbarTitle,
      className,
      classes: classesProp
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    value: valueContext,
    setValue: setValueContext,
    disabled,
    readOnly,
    variant,
    orientation,
    view: viewContext,
    setView: setViewContext,
    views
  } = (0, _usePickerContext.usePickerContext)();
  const translations = (0, _hooks.usePickerTranslations)();
  const ownerState = (0, _useToolbarOwnerState.useToolbarOwnerState)();
  const classes = useUtilityClasses(classesProp, ownerState);
  const adapter = (0, _hooks.usePickerAdapter)();
  const overrides = React.useContext(DateTimePickerToolbarOverrideContext);
  const value = overrides ? overrides.value : valueContext;
  const setValue = overrides ? overrides.setValue : setValueContext;
  const view = overrides ? overrides.view : viewContext;
  const setView = overrides ? overrides.setView : setViewContext;
  const {
    meridiemMode,
    handleMeridiemChange
  } = (0, _dateHelpersHooks.useMeridiemMode)(value, ampm, newValue => setValue(newValue, {
    changeImportance: 'set'
  }));
  const toolbarVariant = overrides?.forceDesktopVariant ? 'desktop' : variant;
  const isDesktop = toolbarVariant === 'desktop';
  const showAmPmControl = Boolean(ampm && !ampmInClock);
  const toolbarTitle = inToolbarTitle ?? translations.dateTimePickerToolbarTitle;
  const dateText = React.useMemo(() => {
    if (!adapter.isValid(value)) {
      return toolbarPlaceholder;
    }
    if (toolbarFormat) {
      return adapter.formatByString(value, toolbarFormat);
    }
    return adapter.format(value, 'shortDate');
  }, [value, toolbarFormat, toolbarPlaceholder, adapter]);
  const formatSection = (format, fallback) => {
    if (!adapter.isValid(value)) {
      return fallback;
    }
    return adapter.format(value, format);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(DateTimePickerToolbarRoot, (0, _extends2.default)({
    className: (0, _clsx.default)(classes.root, className),
    toolbarTitle: toolbarTitle,
    toolbarVariant: toolbarVariant
  }, other, {
    ownerState: ownerState,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(DateTimePickerToolbarDateContainer, {
      className: classes.dateContainer,
      ownerState: ownerState,
      children: [views.includes('year') && /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        tabIndex: -1,
        variant: "subtitle1",
        onClick: () => setView('year'),
        selected: view === 'year',
        value: formatSection('year', '–')
      }), views.includes('day') && /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        tabIndex: -1,
        variant: isDesktop ? 'h5' : 'h4',
        onClick: () => setView('day'),
        selected: view === 'day',
        value: dateText
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(DateTimePickerToolbarTimeContainer, {
      className: classes.timeContainer,
      ownerState: ownerState,
      toolbarVariant: toolbarVariant,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(DateTimePickerToolbarTimeDigitsContainer, {
        className: classes.timeDigitsContainer,
        ownerState: ownerState,
        toolbarVariant: toolbarVariant,
        children: [views.includes('hours') && /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
            variant: isDesktop ? 'h5' : 'h3',
            width: isDesktop && orientation === 'portrait' ? _dimensions.MULTI_SECTION_CLOCK_SECTION_WIDTH : undefined,
            onClick: () => setView('hours'),
            selected: view === 'hours',
            value: formatSection(ampm ? 'hours12h' : 'hours24h', '--')
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(DateTimePickerToolbarSeparator, {
            variant: isDesktop ? 'h5' : 'h3',
            value: ":",
            className: classes.separator,
            ownerState: ownerState,
            toolbarVariant: toolbarVariant
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
            variant: isDesktop ? 'h5' : 'h3',
            width: isDesktop && orientation === 'portrait' ? _dimensions.MULTI_SECTION_CLOCK_SECTION_WIDTH : undefined,
            onClick: () => setView('minutes'),
            selected: view === 'minutes' || !views.includes('minutes') && view === 'hours',
            value: formatSection('minutes', '--'),
            disabled: !views.includes('minutes')
          })]
        }), views.includes('seconds') && /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(DateTimePickerToolbarSeparator, {
            variant: isDesktop ? 'h5' : 'h3',
            value: ":",
            className: classes.separator,
            ownerState: ownerState,
            toolbarVariant: toolbarVariant
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
            variant: isDesktop ? 'h5' : 'h3',
            width: isDesktop && orientation === 'portrait' ? _dimensions.MULTI_SECTION_CLOCK_SECTION_WIDTH : undefined,
            onClick: () => setView('seconds'),
            selected: view === 'seconds',
            value: formatSection('seconds', '--')
          })]
        })]
      }), showAmPmControl && !isDesktop && /*#__PURE__*/(0, _jsxRuntime.jsxs)(DateTimePickerToolbarAmPmSelection, {
        className: classes.ampmSelection,
        ownerState: ownerState,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
          variant: "subtitle2",
          selected: meridiemMode === 'am',
          typographyClassName: classes.ampmLabel,
          value: (0, _dateUtils.formatMeridiem)(adapter, 'am'),
          onClick: readOnly ? undefined : () => handleMeridiemChange('am'),
          disabled: disabled
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
          variant: "subtitle2",
          selected: meridiemMode === 'pm',
          typographyClassName: classes.ampmLabel,
          value: (0, _dateUtils.formatMeridiem)(adapter, 'pm'),
          onClick: readOnly ? undefined : () => handleMeridiemChange('pm'),
          disabled: disabled
        })]
      }), ampm && isDesktop && /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarButton.PickersToolbarButton, {
        variant: "h5",
        onClick: () => setView('meridiem'),
        selected: view === 'meridiem',
        value: value && meridiemMode ? (0, _dateUtils.formatMeridiem)(adapter, meridiemMode) : '--',
        width: _dimensions.MULTI_SECTION_CLOCK_SECTION_WIDTH
      })]
    })]
  }));
}
process.env.NODE_ENV !== "production" ? DateTimePickerToolbar.propTypes = {
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
  toolbarPlaceholder: _propTypes.default.node,
  /**
   * If provided, it will be used instead of `dateTimePickerToolbarTitle` from localization.
   */
  toolbarTitle: _propTypes.default.node
} : void 0;