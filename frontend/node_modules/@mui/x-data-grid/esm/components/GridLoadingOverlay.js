import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["variant", "noRowsVariant", "style"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridRootProps } from "../hooks/utils/useGridRootProps.js";
import { GridOverlay } from "./containers/GridOverlay.js";
import { GridSkeletonLoadingOverlay } from "./GridSkeletonLoadingOverlay.js";
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { gridRowCountSelector, useGridSelector } from "../hooks/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
const LOADING_VARIANTS = {
  'circular-progress': {
    component: rootProps => rootProps.slots.baseCircularProgress,
    style: {}
  },
  'linear-progress': {
    component: rootProps => rootProps.slots.baseLinearProgress,
    style: {
      display: 'block'
    }
  },
  skeleton: {
    component: () => GridSkeletonLoadingOverlay,
    style: {
      display: 'block'
    }
  }
};
const GridLoadingOverlay = forwardRef(function GridLoadingOverlay(props, ref) {
  const {
      variant = 'linear-progress',
      noRowsVariant = 'skeleton',
      style
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const rowsCount = useGridSelector(apiRef, gridRowCountSelector);
  const activeVariant = LOADING_VARIANTS[rowsCount === 0 ? noRowsVariant : variant];
  const Component = activeVariant.component(rootProps);
  return /*#__PURE__*/_jsx(GridOverlay, _extends({
    style: _extends({}, activeVariant.style, style)
  }, other, {
    ref: ref,
    children: /*#__PURE__*/_jsx(Component, {})
  }));
});
if (process.env.NODE_ENV !== "production") GridLoadingOverlay.displayName = "GridLoadingOverlay";
process.env.NODE_ENV !== "production" ? GridLoadingOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The variant of the overlay when no rows are displayed.
   * @default 'skeleton'
   */
  noRowsVariant: PropTypes.oneOf(['circular-progress', 'linear-progress', 'skeleton']),
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object]),
  /**
   * The variant of the overlay.
   * @default 'linear-progress'
   */
  variant: PropTypes.oneOf(['circular-progress', 'linear-progress', 'skeleton'])
} : void 0;
export { GridLoadingOverlay };