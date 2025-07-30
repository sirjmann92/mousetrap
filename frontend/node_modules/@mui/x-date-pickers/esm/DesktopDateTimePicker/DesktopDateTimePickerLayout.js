import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Divider from '@mui/material/Divider';
import { PickersLayoutContentWrapper, PickersLayoutRoot, pickersLayoutClasses, usePickerLayout } from "../PickersLayout/index.js";
import { usePickerContext } from "../hooks/usePickerContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @ignore - internal component.
 */
const DesktopDateTimePickerLayout = /*#__PURE__*/React.forwardRef(function DesktopDateTimePickerLayout(props, ref) {
  const {
    toolbar,
    tabs,
    content,
    actionBar,
    shortcuts,
    ownerState
  } = usePickerLayout(props);
  const {
    orientation
  } = usePickerContext();
  const {
    sx,
    className,
    classes
  } = props;
  const isActionBarVisible = actionBar && (actionBar.props.actions?.length ?? 0) > 0;
  return /*#__PURE__*/_jsxs(PickersLayoutRoot, {
    ref: ref,
    className: clsx(pickersLayoutClasses.root, classes?.root, className),
    sx: [{
      [`& .${pickersLayoutClasses.tabs}`]: {
        gridRow: 4,
        gridColumn: '1 / 4'
      },
      [`& .${pickersLayoutClasses.actionBar}`]: {
        gridRow: 5
      }
    }, ...(Array.isArray(sx) ? sx : [sx])],
    ownerState: ownerState,
    children: [orientation === 'landscape' ? shortcuts : toolbar, orientation === 'landscape' ? toolbar : shortcuts, /*#__PURE__*/_jsxs(PickersLayoutContentWrapper, {
      className: clsx(pickersLayoutClasses.contentWrapper, classes?.contentWrapper),
      ownerState: ownerState,
      sx: {
        display: 'grid'
      },
      children: [content, tabs, isActionBarVisible && /*#__PURE__*/_jsx(Divider, {
        sx: {
          gridRow: 3,
          gridColumn: '1 / 4'
        }
      })]
    }), actionBar]
  });
});
if (process.env.NODE_ENV !== "production") DesktopDateTimePickerLayout.displayName = "DesktopDateTimePickerLayout";
process.env.NODE_ENV !== "production" ? DesktopDateTimePickerLayout.propTypes = {
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
export { DesktopDateTimePickerLayout };