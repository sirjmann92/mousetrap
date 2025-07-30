import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["render", "className", "onClick", "onPointerUp"];
import * as React from 'react';
import PropTypes from 'prop-types';
import useId from '@mui/utils/useId';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useComponentRenderer } from '@mui/x-internals/useComponentRenderer';
import useForkRef from '@mui/utils/useForkRef';
import { useGridPanelContext } from "../panel/GridPanelContext.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { gridFilterActiveItemsSelector, gridPreferencePanelStateSelector, GridPreferencePanelsValue, useGridSelector } from "../../hooks/index.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A button that opens and closes the filter panel.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Filter Panel](https://mui.com/x/react-data-grid/components/filter-panel/)
 *
 * API:
 *
 * - [FilterPanelTrigger API](https://mui.com/x/api/data-grid/filter-panel-trigger/)
 */
const FilterPanelTrigger = forwardRef(function FilterPanelTrigger(props, ref) {
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
  const open = panelState.open && panelState.openedPanelValue === GridPreferencePanelsValue.filters;
  const activeFilters = useGridSelector(apiRef, gridFilterActiveItemsSelector);
  const filterCount = activeFilters.length;
  const state = {
    open,
    filterCount
  };
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const {
    filterPanelTriggerRef
  } = useGridPanelContext();
  const handleRef = useForkRef(ref, filterPanelTriggerRef);
  const handleClick = event => {
    if (open) {
      apiRef.current.hidePreferences();
    } else {
      apiRef.current.showPreferences(GridPreferencePanelsValue.filters, panelId, buttonId);
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
    onClick: handleClick,
    onPointerUp: handlePointerUp,
    className: resolvedClassName
  }, other, {
    ref: handleRef
  }), state);
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") FilterPanelTrigger.displayName = "FilterPanelTrigger";
process.env.NODE_ENV !== "production" ? FilterPanelTrigger.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * A function to customize rendering of the component.
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
export { FilterPanelTrigger };