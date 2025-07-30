"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridNoResultsOverlay = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _GridOverlay = require("./containers/GridOverlay");
var _jsxRuntime = require("react/jsx-runtime");
const GridNoResultsOverlay = exports.GridNoResultsOverlay = (0, _forwardRef.forwardRef)(function GridNoResultsOverlay(props, ref) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const noResultsOverlayLabel = apiRef.current.getLocaleText('noResultsOverlayLabel');
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridOverlay.GridOverlay, (0, _extends2.default)({}, props, {
    ref: ref,
    children: noResultsOverlayLabel
  }));
});
if (process.env.NODE_ENV !== "production") GridNoResultsOverlay.displayName = "GridNoResultsOverlay";