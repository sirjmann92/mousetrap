'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["ampm", "ampmInClock", "toolbarFormat", "toolbarPlaceholder", "toolbarTitle", "className", "classes"];
import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { shouldForwardProp } from '@mui/system/createStyled';
import { PickersToolbarText } from "../internals/components/PickersToolbarText.js";
import { PickersToolbar } from "../internals/components/PickersToolbar.js";
import { PickersToolbarButton } from "../internals/components/PickersToolbarButton.js";
import { usePickerAdapter, usePickerTranslations } from "../hooks/index.js";
import { dateTimePickerToolbarClasses, getDateTimePickerToolbarUtilityClass } from "./dateTimePickerToolbarClasses.js";
import { useMeridiemMode } from "../internals/hooks/date-helpers-hooks.js";
import { MULTI_SECTION_CLOCK_SECTION_WIDTH } from "../internals/constants/dimensions.js";
import { formatMeridiem } from "../internals/utils/date-utils.js";
import { pickersToolbarTextClasses } from "../internals/components/pickersToolbarTextClasses.js";
import { pickersToolbarClasses } from "../internals/components/pickersToolbarClasses.js";
import { usePickerContext } from "../hooks/usePickerContext.js";
import { useToolbarOwnerState } from "../internals/hooks/useToolbarOwnerState.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
  return composeClasses(slots, getDateTimePickerToolbarUtilityClass, classes);
};
const DateTimePickerToolbarRoot = styled(PickersToolbar, {
  name: 'MuiDateTimePickerToolbar',
  slot: 'Root',
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'toolbarVariant'
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
      [`& .${pickersToolbarClasses.content} .${pickersToolbarTextClasses.root}[data-selected]`]: {
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
const DateTimePickerToolbarDateContainer = styled('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'DateContainer'
})({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
});
const DateTimePickerToolbarTimeContainer = styled('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'TimeContainer',
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'toolbarVariant'
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
const DateTimePickerToolbarTimeDigitsContainer = styled('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'TimeDigitsContainer',
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'toolbarVariant'
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
const DateTimePickerToolbarSeparator = styled(PickersToolbarText, {
  name: 'MuiDateTimePickerToolbar',
  slot: 'Separator',
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'toolbarVariant'
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
const DateTimePickerToolbarAmPmSelection = styled('div', {
  name: 'MuiDateTimePickerToolbar',
  slot: 'AmPmSelection',
  overridesResolver: (props, styles) => [{
    [`.${dateTimePickerToolbarClasses.ampmLabel}`]: styles.ampmLabel
  }, {
    [`&.${dateTimePickerToolbarClasses.ampmLandscape}`]: styles.ampmLandscape
  }, styles.ampmSelection]
})({
  display: 'flex',
  flexDirection: 'column',
  marginRight: 'auto',
  marginLeft: 12,
  [`& .${dateTimePickerToolbarClasses.ampmLabel}`]: {
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
export const DateTimePickerToolbarOverrideContext = /*#__PURE__*/React.createContext(null);

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
  const props = useThemeProps({
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
    other = _objectWithoutPropertiesLoose(props, _excluded);
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
  } = usePickerContext();
  const translations = usePickerTranslations();
  const ownerState = useToolbarOwnerState();
  const classes = useUtilityClasses(classesProp, ownerState);
  const adapter = usePickerAdapter();
  const overrides = React.useContext(DateTimePickerToolbarOverrideContext);
  const value = overrides ? overrides.value : valueContext;
  const setValue = overrides ? overrides.setValue : setValueContext;
  const view = overrides ? overrides.view : viewContext;
  const setView = overrides ? overrides.setView : setViewContext;
  const {
    meridiemMode,
    handleMeridiemChange
  } = useMeridiemMode(value, ampm, newValue => setValue(newValue, {
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
  return /*#__PURE__*/_jsxs(DateTimePickerToolbarRoot, _extends({
    className: clsx(classes.root, className),
    toolbarTitle: toolbarTitle,
    toolbarVariant: toolbarVariant
  }, other, {
    ownerState: ownerState,
    children: [/*#__PURE__*/_jsxs(DateTimePickerToolbarDateContainer, {
      className: classes.dateContainer,
      ownerState: ownerState,
      children: [views.includes('year') && /*#__PURE__*/_jsx(PickersToolbarButton, {
        tabIndex: -1,
        variant: "subtitle1",
        onClick: () => setView('year'),
        selected: view === 'year',
        value: formatSection('year', '–')
      }), views.includes('day') && /*#__PURE__*/_jsx(PickersToolbarButton, {
        tabIndex: -1,
        variant: isDesktop ? 'h5' : 'h4',
        onClick: () => setView('day'),
        selected: view === 'day',
        value: dateText
      })]
    }), /*#__PURE__*/_jsxs(DateTimePickerToolbarTimeContainer, {
      className: classes.timeContainer,
      ownerState: ownerState,
      toolbarVariant: toolbarVariant,
      children: [/*#__PURE__*/_jsxs(DateTimePickerToolbarTimeDigitsContainer, {
        className: classes.timeDigitsContainer,
        ownerState: ownerState,
        toolbarVariant: toolbarVariant,
        children: [views.includes('hours') && /*#__PURE__*/_jsxs(React.Fragment, {
          children: [/*#__PURE__*/_jsx(PickersToolbarButton, {
            variant: isDesktop ? 'h5' : 'h3',
            width: isDesktop && orientation === 'portrait' ? MULTI_SECTION_CLOCK_SECTION_WIDTH : undefined,
            onClick: () => setView('hours'),
            selected: view === 'hours',
            value: formatSection(ampm ? 'hours12h' : 'hours24h', '--')
          }), /*#__PURE__*/_jsx(DateTimePickerToolbarSeparator, {
            variant: isDesktop ? 'h5' : 'h3',
            value: ":",
            className: classes.separator,
            ownerState: ownerState,
            toolbarVariant: toolbarVariant
          }), /*#__PURE__*/_jsx(PickersToolbarButton, {
            variant: isDesktop ? 'h5' : 'h3',
            width: isDesktop && orientation === 'portrait' ? MULTI_SECTION_CLOCK_SECTION_WIDTH : undefined,
            onClick: () => setView('minutes'),
            selected: view === 'minutes' || !views.includes('minutes') && view === 'hours',
            value: formatSection('minutes', '--'),
            disabled: !views.includes('minutes')
          })]
        }), views.includes('seconds') && /*#__PURE__*/_jsxs(React.Fragment, {
          children: [/*#__PURE__*/_jsx(DateTimePickerToolbarSeparator, {
            variant: isDesktop ? 'h5' : 'h3',
            value: ":",
            className: classes.separator,
            ownerState: ownerState,
            toolbarVariant: toolbarVariant
          }), /*#__PURE__*/_jsx(PickersToolbarButton, {
            variant: isDesktop ? 'h5' : 'h3',
            width: isDesktop && orientation === 'portrait' ? MULTI_SECTION_CLOCK_SECTION_WIDTH : undefined,
            onClick: () => setView('seconds'),
            selected: view === 'seconds',
            value: formatSection('seconds', '--')
          })]
        })]
      }), showAmPmControl && !isDesktop && /*#__PURE__*/_jsxs(DateTimePickerToolbarAmPmSelection, {
        className: classes.ampmSelection,
        ownerState: ownerState,
        children: [/*#__PURE__*/_jsx(PickersToolbarButton, {
          variant: "subtitle2",
          selected: meridiemMode === 'am',
          typographyClassName: classes.ampmLabel,
          value: formatMeridiem(adapter, 'am'),
          onClick: readOnly ? undefined : () => handleMeridiemChange('am'),
          disabled: disabled
        }), /*#__PURE__*/_jsx(PickersToolbarButton, {
          variant: "subtitle2",
          selected: meridiemMode === 'pm',
          typographyClassName: classes.ampmLabel,
          value: formatMeridiem(adapter, 'pm'),
          onClick: readOnly ? undefined : () => handleMeridiemChange('pm'),
          disabled: disabled
        })]
      }), ampm && isDesktop && /*#__PURE__*/_jsx(PickersToolbarButton, {
        variant: "h5",
        onClick: () => setView('meridiem'),
        selected: view === 'meridiem',
        value: value && meridiemMode ? formatMeridiem(adapter, meridiemMode) : '--',
        width: MULTI_SECTION_CLOCK_SECTION_WIDTH
      })]
    })]
  }));
}
process.env.NODE_ENV !== "production" ? DateTimePickerToolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  ampm: PropTypes.bool,
  ampmInClock: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * If `true`, show the toolbar even in desktop mode.
   * @default `true` for Desktop, `false` for Mobile.
   */
  hidden: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object]),
  titleId: PropTypes.string,
  /**
   * Toolbar date format.
   */
  toolbarFormat: PropTypes.string,
  /**
   * Toolbar value placeholder—it is displayed when the value is empty.
   * @default "––"
   */
  toolbarPlaceholder: PropTypes.node,
  /**
   * If provided, it will be used instead of `dateTimePickerToolbarTitle` from localization.
   */
  toolbarTitle: PropTypes.node
} : void 0;
export { DateTimePickerToolbar };