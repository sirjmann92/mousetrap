import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["render", "className", "onClick"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useComponentRenderer } from '@mui/x-internals/useComponentRenderer';
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { useQuickFilterContext } from "./QuickFilterContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A button that resets the filter value.
 * It renders the `baseIconButton` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterClear API](https://mui.com/x/api/data-grid/quick-filter-clear/)
 */
const QuickFilterClear = forwardRef(function QuickFilterClear(props, ref) {
  const {
      render,
      className,
      onClick
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const {
    state,
    clearValue
  } = useQuickFilterContext();
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const handleClick = event => {
    clearValue();
    onClick?.(event);
  };
  const element = useComponentRenderer(rootProps.slots.baseIconButton, render, _extends({}, rootProps.slotProps?.baseIconButton, {
    className: resolvedClassName,
    tabIndex: -1
  }, other, {
    onClick: handleClick,
    ref
  }), state);
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") QuickFilterClear.displayName = "QuickFilterClear";
process.env.NODE_ENV !== "production" ? QuickFilterClear.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  className: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  color: PropTypes.oneOf(['default', 'inherit', 'primary']),
  disabled: PropTypes.bool,
  edge: PropTypes.oneOf(['end', 'start', false]),
  id: PropTypes.string,
  label: PropTypes.string,
  /**
   * A function to customize rendering of the component.
   */
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  role: PropTypes.string,
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  style: PropTypes.object,
  tabIndex: PropTypes.number,
  title: PropTypes.string,
  touchRippleRef: PropTypes.any
} : void 0;
export { QuickFilterClear };