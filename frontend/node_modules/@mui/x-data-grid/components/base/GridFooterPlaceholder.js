"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridFooterPlaceholder = GridFooterPlaceholder;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
function GridFooterPlaceholder() {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  if (rootProps.hideFooter) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.footer, (0, _extends2.default)({}, rootProps.slotProps?.footer /* FIXME: typing error */));
}