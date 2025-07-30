'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import PropTypes from 'prop-types';
import useId from '@mui/utils/useId';
import useForkRef from '@mui/utils/useForkRef';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { gridDensitySelector } from "../../hooks/features/density/densitySelector.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { useGridSelector } from "../../hooks/utils/useGridSelector.js";
import { GridMenu } from "../menu/GridMenu.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { gridClasses } from "../../constants/gridClasses.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @deprecated See {@link https://mui.com/x/react-data-grid/accessibility/#set-the-density-programmatically Accessibility—Set the density programmatically} for an example of adding a density selector to the toolbar. This component will be removed in a future major release.
 */
const GridToolbarDensitySelector = forwardRef(function GridToolbarDensitySelector(props, ref) {
  const {
    slotProps = {}
  } = props;
  const buttonProps = slotProps.button || {};
  const tooltipProps = slotProps.tooltip || {};
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const density = useGridSelector(apiRef, gridDensitySelector);
  const densityButtonId = useId();
  const densityMenuId = useId();
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  const handleRef = useForkRef(ref, buttonRef);
  const densityOptions = [{
    icon: /*#__PURE__*/_jsx(rootProps.slots.densityCompactIcon, {}),
    label: apiRef.current.getLocaleText('toolbarDensityCompact'),
    value: 'compact'
  }, {
    icon: /*#__PURE__*/_jsx(rootProps.slots.densityStandardIcon, {}),
    label: apiRef.current.getLocaleText('toolbarDensityStandard'),
    value: 'standard'
  }, {
    icon: /*#__PURE__*/_jsx(rootProps.slots.densityComfortableIcon, {}),
    label: apiRef.current.getLocaleText('toolbarDensityComfortable'),
    value: 'comfortable'
  }];
  const startIcon = React.useMemo(() => {
    switch (density) {
      case 'compact':
        return /*#__PURE__*/_jsx(rootProps.slots.densityCompactIcon, {});
      case 'comfortable':
        return /*#__PURE__*/_jsx(rootProps.slots.densityComfortableIcon, {});
      default:
        return /*#__PURE__*/_jsx(rootProps.slots.densityStandardIcon, {});
    }
  }, [density, rootProps]);
  const handleDensitySelectorOpen = event => {
    setOpen(prevOpen => !prevOpen);
    buttonProps.onClick?.(event);
  };
  const handleDensitySelectorClose = () => {
    setOpen(false);
  };
  const handleDensityUpdate = newDensity => {
    apiRef.current.setDensity(newDensity);
    setOpen(false);
  };

  // Disable the button if the corresponding is disabled
  if (rootProps.disableDensitySelector) {
    return null;
  }
  const densityElements = densityOptions.map((option, index) => /*#__PURE__*/_jsx(rootProps.slots.baseMenuItem, {
    onClick: () => handleDensityUpdate(option.value),
    selected: option.value === density,
    iconStart: option.icon,
    children: option.label
  }, index));
  return /*#__PURE__*/_jsxs(React.Fragment, {
    children: [/*#__PURE__*/_jsx(rootProps.slots.baseTooltip, _extends({
      title: apiRef.current.getLocaleText('toolbarDensityLabel'),
      enterDelay: 1000
    }, rootProps.slotProps?.baseTooltip, tooltipProps, {
      children: /*#__PURE__*/_jsx(rootProps.slots.baseButton, _extends({
        size: "small",
        startIcon: startIcon,
        "aria-label": apiRef.current.getLocaleText('toolbarDensityLabel'),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? densityMenuId : undefined,
        id: densityButtonId
      }, rootProps.slotProps?.baseButton, buttonProps, {
        onClick: handleDensitySelectorOpen,
        ref: handleRef,
        children: apiRef.current.getLocaleText('toolbarDensity')
      }))
    })), /*#__PURE__*/_jsx(GridMenu, {
      open: open,
      target: buttonRef.current,
      onClose: handleDensitySelectorClose,
      position: "bottom-end",
      children: /*#__PURE__*/_jsx(rootProps.slots.baseMenuList, {
        id: densityMenuId,
        className: gridClasses.menuList,
        "aria-labelledby": densityButtonId,
        autoFocusItem: open,
        children: densityElements
      })
    })]
  });
});
if (process.env.NODE_ENV !== "production") GridToolbarDensitySelector.displayName = "GridToolbarDensitySelector";
process.env.NODE_ENV !== "production" ? GridToolbarDensitySelector.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.object
} : void 0;
export { GridToolbarDensitySelector };