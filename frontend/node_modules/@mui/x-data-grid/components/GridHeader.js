"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridHeader = GridHeader;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _GridPreferencesPanel = require("./panel/GridPreferencesPanel");
var _jsxRuntime = require("react/jsx-runtime");
function GridHeader() {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_GridPreferencesPanel.GridPreferencesPanel, {}), rootProps.showToolbar && /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.toolbar, (0, _extends2.default)({}, rootProps.slotProps?.toolbar))]
  });
}