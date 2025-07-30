import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { styled } from '@mui/system';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { useGridConfiguration } from "../../hooks/utils/useGridConfiguration.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const GridPanelAnchor = styled('div')({
  position: 'absolute',
  top: `var(--DataGrid-headersTotalHeight)`,
  left: 0,
  width: 'calc(100% - (var(--DataGrid-hasScrollY) * var(--DataGrid-scrollbarSize)))'
});
const Element = styled('div', {
  name: 'MuiDataGrid',
  slot: 'Main',
  overridesResolver: (props, styles) => {
    const {
      ownerState,
      loadingOverlayVariant,
      overlayType
    } = props;
    const hideContent = loadingOverlayVariant === 'skeleton' || overlayType === 'noColumnsOverlay';
    return [styles.main, ownerState.hasPinnedRight && styles['main--hasPinnedRight'], hideContent && styles['main--hiddenContent']];
  }
})({
  flexGrow: 1,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
});
export const GridMainContainer = forwardRef((props, ref) => {
  const {
    ownerState
  } = props;
  const rootProps = useGridRootProps();
  const configuration = useGridConfiguration();
  const ariaAttributes = configuration.hooks.useGridAriaAttributes();
  return /*#__PURE__*/_jsxs(Element, _extends({
    ownerState: ownerState,
    className: props.className,
    tabIndex: -1
  }, ariaAttributes, rootProps.slotProps?.main, {
    ref: ref,
    children: [/*#__PURE__*/_jsx(GridPanelAnchor, {
      role: "presentation",
      "data-id": "gridPanelAnchor"
    }), props.children]
  }));
});
if (process.env.NODE_ENV !== "production") GridMainContainer.displayName = "GridMainContainer";