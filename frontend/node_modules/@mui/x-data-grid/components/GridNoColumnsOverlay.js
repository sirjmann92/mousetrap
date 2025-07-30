"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridNoColumnsOverlay = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _GridOverlay = require("./containers/GridOverlay");
var _gridPreferencePanelsValue = require("../hooks/features/preferencesPanel/gridPreferencePanelsValue");
var _hooks = require("../hooks");
var _jsxRuntime = require("react/jsx-runtime");
const GridNoColumnsOverlay = exports.GridNoColumnsOverlay = (0, _forwardRef.forwardRef)(function GridNoColumnsOverlay(props, ref) {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const columns = (0, _hooks.useGridSelector)(apiRef, _hooks.gridColumnFieldsSelector);
  const handleOpenManageColumns = () => {
    apiRef.current.showPreferences(_gridPreferencePanelsValue.GridPreferencePanelsValue.columns);
  };
  const showManageColumnsButton = !rootProps.disableColumnSelector && columns.length > 0;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_GridOverlay.GridOverlay, (0, _extends2.default)({}, props, {
    ref: ref,
    children: [apiRef.current.getLocaleText('noColumnsOverlayLabel'), showManageColumnsButton && /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseButton, (0, _extends2.default)({
      size: "small"
    }, rootProps.slotProps?.baseButton, {
      onClick: handleOpenManageColumns,
      children: apiRef.current.getLocaleText('noColumnsOverlayManageColumns')
    }))]
  }));
});
if (process.env.NODE_ENV !== "production") GridNoColumnsOverlay.displayName = "GridNoColumnsOverlay";
process.env.NODE_ENV !== "production" ? GridNoColumnsOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;