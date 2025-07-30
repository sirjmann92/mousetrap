'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["open", "target", "onClose", "children", "position", "className", "onExited"];
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import HTMLElementType from '@mui/utils/HTMLElementType';
import { styled } from '@mui/material/styles';
import { isHideMenuKey } from "../../utils/keyboardUtils.js";
import { vars } from "../../constants/cssVariables.js";
import { useCSSVariablesClass } from "../../utils/css/context.js";
import { getDataGridUtilityClass, gridClasses } from "../../constants/gridClasses.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { NotRendered } from "../../utils/assert.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['menu']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridMenuRoot = styled(NotRendered, {
  name: 'MuiDataGrid',
  slot: 'Menu'
})({
  zIndex: vars.zIndex.menu,
  [`& .${gridClasses.menuList}`]: {
    outline: 0
  }
});
function GridMenu(props) {
  const {
      open,
      target,
      onClose,
      children,
      position,
      className,
      onExited
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  const variablesClass = useCSSVariablesClass();
  const savedFocusRef = React.useRef(null);
  useEnhancedEffect(() => {
    if (open) {
      savedFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    } else {
      savedFocusRef.current?.focus?.();
      savedFocusRef.current = null;
    }
  }, [open]);
  React.useEffect(() => {
    // Emit menuOpen or menuClose events
    const eventName = open ? 'menuOpen' : 'menuClose';
    apiRef.current.publishEvent(eventName, {
      target
    });
  }, [apiRef, open, target]);
  const handleClickAway = event => {
    if (event.target && (target === event.target || target?.contains(event.target))) {
      return;
    }
    onClose(event);
  };
  const handleKeyDown = event => {
    if (isHideMenuKey(event.key)) {
      onClose(event);
    }
  };
  return /*#__PURE__*/_jsx(GridMenuRoot, _extends({
    as: rootProps.slots.basePopper,
    className: clsx(classes.root, className, variablesClass),
    ownerState: rootProps,
    open: open,
    target: target,
    transition: true,
    placement: position,
    onClickAway: handleClickAway,
    onExited: onExited,
    clickAwayMouseEvent: "onMouseDown",
    onKeyDown: handleKeyDown
  }, other, rootProps.slotProps?.basePopper, {
    children: children
  }));
}
process.env.NODE_ENV !== "production" ? GridMenu.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
  className: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onExited: PropTypes.func,
  open: PropTypes.bool.isRequired,
  position: PropTypes.oneOf(['bottom-end', 'bottom-start', 'bottom', 'left-end', 'left-start', 'left', 'right-end', 'right-start', 'right', 'top-end', 'top-start', 'top']),
  target: HTMLElementType
} : void 0;
export { GridMenu };