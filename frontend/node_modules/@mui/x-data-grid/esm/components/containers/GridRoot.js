import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className", "children", "sidePanel"];
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import useForkRef from '@mui/utils/useForkRef';
import capitalize from '@mui/utils/capitalize';
import composeClasses from '@mui/utils/composeClasses';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { GridRootStyles } from "./GridRootStyles.js";
import { useCSSVariablesContext } from "../../utils/css/context.js";
import { useGridSelector } from "../../hooks/utils/useGridSelector.js";
import { useGridPrivateApiContext } from "../../hooks/utils/useGridPrivateApiContext.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { getDataGridUtilityClass, gridClasses } from "../../constants/gridClasses.js";
import { gridDensitySelector } from "../../hooks/features/density/densitySelector.js";
import { useIsSSR } from "../../hooks/utils/useIsSSR.js";
import { GridHeader } from "../GridHeader.js";
import { GridBody, GridFooterPlaceholder } from "../base/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const useUtilityClasses = (ownerState, density) => {
  const {
    autoHeight,
    classes,
    showCellVerticalBorder
  } = ownerState;
  const slots = {
    root: ['root', autoHeight && 'autoHeight', `root--density${capitalize(density)}`, ownerState.slots.toolbar === null && 'root--noToolbar', 'withBorderColor', showCellVerticalBorder && 'withVerticalBorder']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridRoot = forwardRef(function GridRoot(props, ref) {
  const rootProps = useGridRootProps();
  const {
      className,
      children,
      sidePanel
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const apiRef = useGridPrivateApiContext();
  const density = useGridSelector(apiRef, gridDensitySelector);
  const rootElementRef = apiRef.current.rootElementRef;
  const rootMountCallback = React.useCallback(node => {
    if (node === null) {
      return;
    }
    apiRef.current.publishEvent('rootMount', node);
  }, [apiRef]);
  const handleRef = useForkRef(rootElementRef, ref, rootMountCallback);
  const ownerState = rootProps;
  const classes = useUtilityClasses(ownerState, density);
  const cssVariables = useCSSVariablesContext();
  const isSSR = useIsSSR();
  if (isSSR) {
    return null;
  }
  return /*#__PURE__*/_jsxs(GridRootStyles, _extends({
    className: clsx(classes.root, className, cssVariables.className, sidePanel && gridClasses.withSidePanel),
    ownerState: ownerState
  }, other, {
    ref: handleRef,
    children: [/*#__PURE__*/_jsxs("div", {
      className: gridClasses.mainContent,
      role: "presentation",
      children: [/*#__PURE__*/_jsx(GridHeader, {}), /*#__PURE__*/_jsx(GridBody, {
        children: children
      }), /*#__PURE__*/_jsx(GridFooterPlaceholder, {})]
    }), sidePanel, cssVariables.tag]
  }));
});
if (process.env.NODE_ENV !== "production") GridRoot.displayName = "GridRoot";
process.env.NODE_ENV !== "production" ? GridRoot.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sidePanel: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
const MemoizedGridRoot = fastMemo(GridRoot);
export { MemoizedGridRoot as GridRoot };