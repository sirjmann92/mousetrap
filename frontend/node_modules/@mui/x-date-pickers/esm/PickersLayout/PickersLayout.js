'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { pickersLayoutClasses, getPickersLayoutUtilityClass } from "./pickersLayoutClasses.js";
import usePickerLayout from "./usePickerLayout.js";
import { usePickerContext } from "../hooks/usePickerContext.js";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = (classes, ownerState) => {
  const {
    pickerOrientation
  } = ownerState;
  const slots = {
    root: ['root', pickerOrientation === 'landscape' && 'landscape'],
    contentWrapper: ['contentWrapper']
  };
  return composeClasses(slots, getPickersLayoutUtilityClass, classes);
};
export const PickersLayoutRoot = styled('div', {
  name: 'MuiPickersLayout',
  slot: 'Root'
})({
  display: 'grid',
  gridAutoColumns: 'max-content auto max-content',
  gridAutoRows: 'max-content auto max-content',
  [`& .${pickersLayoutClasses.actionBar}`]: {
    gridColumn: '1 / 4',
    gridRow: 3
  },
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      [`& .${pickersLayoutClasses.toolbar}`]: {
        gridColumn: 1,
        gridRow: '2 / 3'
      },
      [`.${pickersLayoutClasses.shortcuts}`]: {
        gridColumn: '2 / 4',
        gridRow: 1
      }
    }
  }, {
    props: {
      pickerOrientation: 'landscape',
      layoutDirection: 'rtl'
    },
    style: {
      [`& .${pickersLayoutClasses.toolbar}`]: {
        gridColumn: 3
      }
    }
  }, {
    props: {
      pickerOrientation: 'portrait'
    },
    style: {
      [`& .${pickersLayoutClasses.toolbar}`]: {
        gridColumn: '2 / 4',
        gridRow: 1
      },
      [`& .${pickersLayoutClasses.shortcuts}`]: {
        gridColumn: 1,
        gridRow: '2 / 3'
      }
    }
  }, {
    props: {
      pickerOrientation: 'portrait',
      layoutDirection: 'rtl'
    },
    style: {
      [`& .${pickersLayoutClasses.shortcuts}`]: {
        gridColumn: 4
      }
    }
  }]
});
export const PickersLayoutContentWrapper = styled('div', {
  name: 'MuiPickersLayout',
  slot: 'ContentWrapper'
})({
  gridColumn: '2 / 4',
  gridRow: 2,
  display: 'flex',
  flexDirection: 'column'
});
/**
 * Demos:
 *
 * - [Custom layout](https://mui.com/x/react-date-pickers/custom-layout/)
 *
 * API:
 *
 * - [PickersLayout API](https://mui.com/x/api/date-pickers/pickers-layout/)
 */
const PickersLayout = /*#__PURE__*/React.forwardRef(function PickersLayout(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPickersLayout'
  });
  const {
    toolbar,
    content,
    tabs,
    actionBar,
    shortcuts,
    ownerState
  } = usePickerLayout(props);
  const {
    orientation,
    variant
  } = usePickerContext();
  const {
    sx,
    className,
    classes: classesProp
  } = props;
  const classes = useUtilityClasses(classesProp, ownerState);
  return /*#__PURE__*/_jsxs(PickersLayoutRoot, {
    ref: ref,
    sx: sx,
    className: clsx(classes.root, className),
    ownerState: ownerState,
    children: [orientation === 'landscape' ? shortcuts : toolbar, orientation === 'landscape' ? toolbar : shortcuts, /*#__PURE__*/_jsx(PickersLayoutContentWrapper, {
      className: classes.contentWrapper,
      ownerState: ownerState,
      children: variant === 'desktop' ? /*#__PURE__*/_jsxs(React.Fragment, {
        children: [content, tabs]
      }) : /*#__PURE__*/_jsxs(React.Fragment, {
        children: [tabs, content]
      })
    }), actionBar]
  });
});
if (process.env.NODE_ENV !== "production") PickersLayout.displayName = "PickersLayout";
process.env.NODE_ENV !== "production" ? PickersLayout.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { PickersLayout };