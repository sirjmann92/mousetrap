import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["render", "className", "onClick", "onPointerUp"];
import * as React from 'react';
import PropTypes from 'prop-types';
import useId from '@mui/utils/useId';
import { forwardRef } from '@mui/x-internals/forwardRef';
import useForkRef from '@mui/utils/useForkRef';
import { useComponentRenderer } from '@mui/x-internals/useComponentRenderer';
import { useGridPanelContext } from "../panel/GridPanelContext.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { gridPreferencePanelStateSelector, GridPreferencePanelsValue, useGridSelector } from "../../hooks/index.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A button that opens and closes the columns panel.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Columns Panel](https://mui.com/x/react-data-grid/components/columns-panel/)
 *
 * API:
 *
 * - [ColumnsPanelTrigger API](https://mui.com/x/api/data-grid/columns-panel-trigger/)
 */
const ColumnsPanelTrigger = forwardRef(function ColumnsPanelTrigger(props, ref) {
  const {
      render,
      className,
      onClick,
      onPointerUp
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const buttonId = useId();
  const panelId = useId();
  const apiRef = useGridApiContext();
  const panelState = useGridSelector(apiRef, gridPreferencePanelStateSelector);
  const open = panelState.open && panelState.openedPanelValue === GridPreferencePanelsValue.columns;
  const state = {
    open
  };
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const {
    columnsPanelTriggerRef
  } = useGridPanelContext();
  const handleRef = useForkRef(ref, columnsPanelTriggerRef);
  const handleClick = event => {
    if (open) {
      apiRef.current.hidePreferences();
    } else {
      apiRef.current.showPreferences(GridPreferencePanelsValue.columns, panelId, buttonId);
    }
    onClick?.(event);
  };
  const handlePointerUp = event => {
    if (open) {
      event.stopPropagation();
    }
    onPointerUp?.(event);
  };
  const element = useComponentRenderer(rootProps.slots.baseButton, render, _extends({}, rootProps.slotProps?.baseButton, {
    id: buttonId,
    'aria-haspopup': 'true',
    'aria-expanded': open ? 'true' : undefined,
    'aria-controls': open ? panelId : undefined,
    className: resolvedClassName
  }, other, {
    onPointerUp: handlePointerUp,
    onClick: handleClick,
    ref: handleRef
  }), state);
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ColumnsPanelTrigger.displayName = "ColumnsPanelTrigger";
process.env.NODE_ENV !== "production" ? ColumnsPanelTrigger.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  disabled: PropTypes.bool,
  id: PropTypes.string,
  /**
   * A function to customize rendering of the component.
   */
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  role: PropTypes.string,
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  startIcon: PropTypes.node,
  style: PropTypes.object,
  tabIndex: PropTypes.number,
  title: PropTypes.string,
  touchRippleRef: PropTypes.any
} : void 0;
export { ColumnsPanelTrigger };