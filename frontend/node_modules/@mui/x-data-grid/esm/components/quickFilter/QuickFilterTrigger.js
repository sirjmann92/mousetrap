import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["render", "className", "onClick"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useComponentRenderer } from '@mui/x-internals/useComponentRenderer';
import useForkRef from '@mui/utils/useForkRef';
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { useQuickFilterContext } from "./QuickFilterContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A button that expands/collapses the quick filter.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterTrigger API](https://mui.com/x/api/data-grid/quick-filter-trigger/)
 */
const QuickFilterTrigger = forwardRef(function QuickFilterTrigger(props, ref) {
  const {
      render,
      className,
      onClick
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const {
    state,
    controlId,
    onExpandedChange,
    triggerRef
  } = useQuickFilterContext();
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const handleRef = useForkRef(triggerRef, ref);
  const handleClick = event => {
    onExpandedChange(!state.expanded);
    onClick?.(event);
  };
  const element = useComponentRenderer(rootProps.slots.baseButton, render, _extends({}, rootProps.slotProps?.baseButton, {
    className: resolvedClassName,
    'aria-controls': controlId,
    'aria-expanded': state.expanded
  }, other, {
    onClick: handleClick,
    ref: handleRef
  }), state);
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") QuickFilterTrigger.displayName = "QuickFilterTrigger";
process.env.NODE_ENV !== "production" ? QuickFilterTrigger.propTypes = {
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
export { QuickFilterTrigger };