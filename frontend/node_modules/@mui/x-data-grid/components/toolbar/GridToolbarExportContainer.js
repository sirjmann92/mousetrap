"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbarExportContainer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _GridMenu = require("../menu/GridMenu");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../constants/gridClasses");
var _jsxRuntime = require("react/jsx-runtime");
const GridToolbarExportContainer = exports.GridToolbarExportContainer = (0, _forwardRef.forwardRef)(function GridToolbarExportContainer(props, ref) {
  const {
    children,
    slotProps = {}
  } = props;
  const buttonProps = slotProps.button || {};
  const tooltipProps = slotProps.tooltip || {};
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const exportButtonId = (0, _useId.default)();
  const exportMenuId = (0, _useId.default)();
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  const handleRef = (0, _useForkRef.default)(ref, buttonRef);
  const handleMenuOpen = event => {
    setOpen(prevOpen => !prevOpen);
    buttonProps.onClick?.(event);
  };
  const handleMenuClose = () => setOpen(false);
  if (children == null) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, (0, _extends2.default)({
      title: apiRef.current.getLocaleText('toolbarExportLabel'),
      enterDelay: 1000
    }, rootProps.slotProps?.baseTooltip, tooltipProps, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseButton, (0, _extends2.default)({
        size: "small",
        startIcon: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.exportIcon, {}),
        "aria-expanded": open,
        "aria-label": apiRef.current.getLocaleText('toolbarExportLabel'),
        "aria-haspopup": "menu",
        "aria-controls": open ? exportMenuId : undefined,
        id: exportButtonId
      }, rootProps.slotProps?.baseButton, buttonProps, {
        onClick: handleMenuOpen,
        ref: handleRef,
        children: apiRef.current.getLocaleText('toolbarExport')
      }))
    })), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridMenu.GridMenu, {
      open: open,
      target: buttonRef.current,
      onClose: handleMenuClose,
      position: "bottom-end",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuList, {
        id: exportMenuId,
        className: _gridClasses.gridClasses.menuList,
        "aria-labelledby": exportButtonId,
        autoFocusItem: open,
        children: React.Children.map(children, child => {
          if (! /*#__PURE__*/React.isValidElement(child)) {
            return child;
          }
          return /*#__PURE__*/React.cloneElement(child, {
            hideMenu: handleMenuClose
          });
        })
      })
    })]
  });
});
if (process.env.NODE_ENV !== "production") GridToolbarExportContainer.displayName = "GridToolbarExportContainer";
process.env.NODE_ENV !== "production" ? GridToolbarExportContainer.propTypes = {
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