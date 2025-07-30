"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbarDensitySelector = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _densitySelector = require("../../hooks/features/density/densitySelector");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _GridMenu = require("../menu/GridMenu");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../constants/gridClasses");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * @deprecated See {@link https://mui.com/x/react-data-grid/accessibility/#set-the-density-programmatically Accessibility—Set the density programmatically} for an example of adding a density selector to the toolbar. This component will be removed in a future major release.
 */
const GridToolbarDensitySelector = exports.GridToolbarDensitySelector = (0, _forwardRef.forwardRef)(function GridToolbarDensitySelector(props, ref) {
  const {
    slotProps = {}
  } = props;
  const buttonProps = slotProps.button || {};
  const tooltipProps = slotProps.tooltip || {};
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const density = (0, _useGridSelector.useGridSelector)(apiRef, _densitySelector.gridDensitySelector);
  const densityButtonId = (0, _useId.default)();
  const densityMenuId = (0, _useId.default)();
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  const handleRef = (0, _useForkRef.default)(ref, buttonRef);
  const densityOptions = [{
    icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.densityCompactIcon, {}),
    label: apiRef.current.getLocaleText('toolbarDensityCompact'),
    value: 'compact'
  }, {
    icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.densityStandardIcon, {}),
    label: apiRef.current.getLocaleText('toolbarDensityStandard'),
    value: 'standard'
  }, {
    icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.densityComfortableIcon, {}),
    label: apiRef.current.getLocaleText('toolbarDensityComfortable'),
    value: 'comfortable'
  }];
  const startIcon = React.useMemo(() => {
    switch (density) {
      case 'compact':
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.densityCompactIcon, {});
      case 'comfortable':
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.densityComfortableIcon, {});
      default:
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.densityStandardIcon, {});
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
  const densityElements = densityOptions.map((option, index) => /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, {
    onClick: () => handleDensityUpdate(option.value),
    selected: option.value === density,
    iconStart: option.icon,
    children: option.label
  }, index));
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, (0, _extends2.default)({
      title: apiRef.current.getLocaleText('toolbarDensityLabel'),
      enterDelay: 1000
    }, rootProps.slotProps?.baseTooltip, tooltipProps, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseButton, (0, _extends2.default)({
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
    })), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridMenu.GridMenu, {
      open: open,
      target: buttonRef.current,
      onClose: handleDensitySelectorClose,
      position: "bottom-end",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuList, {
        id: densityMenuId,
        className: _gridClasses.gridClasses.menuList,
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
  slotProps: _propTypes.default.object
} : void 0;