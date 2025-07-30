'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["toolbarFormat", "toolbarPlaceholder", "className", "classes"];
import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { PickersToolbar } from "../internals/components/PickersToolbar.js";
import { usePickerAdapter, usePickerContext, usePickerTranslations } from "../hooks/index.js";
import { getDatePickerToolbarUtilityClass } from "./datePickerToolbarClasses.js";
import { resolveDateFormat } from "../internals/utils/date-utils.js";
import { useToolbarOwnerState } from "../internals/hooks/useToolbarOwnerState.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    title: ['title']
  };
  return composeClasses(slots, getDatePickerToolbarUtilityClass, classes);
};
const DatePickerToolbarRoot = styled(PickersToolbar, {
  name: 'MuiDatePickerToolbar',
  slot: 'Root'
})({});
const DatePickerToolbarTitle = styled(Typography, {
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
export const DatePickerToolbar = /*#__PURE__*/React.forwardRef(function DatePickerToolbar(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiDatePickerToolbar'
  });
  const {
      toolbarFormat,
      toolbarPlaceholder = '––',
      className,
      classes: classesProp
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const adapter = usePickerAdapter();
  const {
    value,
    views,
    orientation
  } = usePickerContext();
  const translations = usePickerTranslations();
  const ownerState = useToolbarOwnerState();
  const classes = useUtilityClasses(classesProp);
  const dateText = React.useMemo(() => {
    if (!adapter.isValid(value)) {
      return toolbarPlaceholder;
    }
    const formatFromViews = resolveDateFormat(adapter, {
      format: toolbarFormat,
      views
    }, true);
    return adapter.formatByString(value, formatFromViews);
  }, [value, toolbarFormat, toolbarPlaceholder, adapter, views]);
  return /*#__PURE__*/_jsx(DatePickerToolbarRoot, _extends({
    ref: ref,
    toolbarTitle: translations.datePickerToolbarTitle,
    className: clsx(classes.root, className)
  }, other, {
    children: /*#__PURE__*/_jsx(DatePickerToolbarTitle, {
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
  toolbarPlaceholder: PropTypes.node
} : void 0;