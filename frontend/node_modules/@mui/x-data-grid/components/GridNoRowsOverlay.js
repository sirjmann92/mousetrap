"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridNoRowsOverlay = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _GridOverlay = require("./containers/GridOverlay");
var _jsxRuntime = require("react/jsx-runtime");
const GridNoRowsOverlay = exports.GridNoRowsOverlay = (0, _forwardRef.forwardRef)(function GridNoRowsOverlay(props, ref) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const noRowsLabel = apiRef.current.getLocaleText('noRowsLabel');
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridOverlay.GridOverlay, (0, _extends2.default)({}, props, {
    ref: ref,
    children: noRowsLabel
  }));
});
if (process.env.NODE_ENV !== "production") GridNoRowsOverlay.displayName = "GridNoRowsOverlay";
process.env.NODE_ENV !== "production" ? GridNoRowsOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;