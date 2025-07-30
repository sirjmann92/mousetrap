'use client';

import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Tab from '@mui/material/Tab';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { TimeIcon, DateRangeIcon } from "../icons/index.js";
import { usePickerTranslations } from "../hooks/usePickerTranslations.js";
import { getDateTimePickerTabsUtilityClass } from "./dateTimePickerTabsClasses.js";
import { isDatePickerView } from "../internals/utils/date-utils.js";
import { usePickerPrivateContext } from "../internals/hooks/usePickerPrivateContext.js";
import { usePickerContext } from "../hooks/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const viewToTab = view => {
  if (isDatePickerView(view)) {
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
  return composeClasses(slots, getDateTimePickerTabsUtilityClass, classes);
};
const DateTimePickerTabsRoot = styled(Tabs, {
  name: 'MuiDateTimePickerTabs',
  slot: 'Root'
})(({
  theme
}) => ({
  boxShadow: `0 -1px 0 0 inset ${(theme.vars || theme).palette.divider}`,
  '&:last-child': {
    boxShadow: `0 1px 0 0 inset ${(theme.vars || theme).palette.divider}`,
    [`& .${tabsClasses.indicator}`]: {
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
const DateTimePickerTabs = function DateTimePickerTabs(inProps) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiDateTimePickerTabs'
  });
  const {
    dateIcon = /*#__PURE__*/_jsx(DateRangeIcon, {}),
    timeIcon = /*#__PURE__*/_jsx(TimeIcon, {}),
    hidden = typeof window === 'undefined' || window.innerHeight < 667,
    className,
    classes: classesProp,
    sx
  } = props;
  const translations = usePickerTranslations();
  const {
    ownerState
  } = usePickerPrivateContext();
  const {
    view,
    setView
  } = usePickerContext();
  const classes = useUtilityClasses(classesProp);
  const handleChange = (event, value) => {
    setView(tabToView(value));
  };
  if (hidden) {
    return null;
  }
  return /*#__PURE__*/_jsxs(DateTimePickerTabsRoot, {
    ownerState: ownerState,
    variant: "fullWidth",
    value: viewToTab(view),
    onChange: handleChange,
    className: clsx(className, classes.root),
    sx: sx,
    children: [/*#__PURE__*/_jsx(Tab, {
      value: "date",
      "aria-label": translations.dateTableLabel,
      icon: /*#__PURE__*/_jsx(React.Fragment, {
        children: dateIcon
      })
    }), /*#__PURE__*/_jsx(Tab, {
      value: "time",
      "aria-label": translations.timeTableLabel,
      icon: /*#__PURE__*/_jsx(React.Fragment, {
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
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * Date tab icon.
   * @default DateRange
   */
  dateIcon: PropTypes.node,
  /**
   * Toggles visibility of the tabs allowing view switching.
   * @default `window.innerHeight < 667` for `DesktopDateTimePicker` and `MobileDateTimePicker`, `displayStaticWrapperAs === 'desktop'` for `StaticDateTimePicker`
   */
  hidden: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object]),
  /**
   * Time tab icon.
   * @default Time
   */
  timeIcon: PropTypes.node
} : void 0;
export { DateTimePickerTabs };