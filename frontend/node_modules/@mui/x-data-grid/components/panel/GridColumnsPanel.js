"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnsPanel = GridColumnsPanel;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _GridPanelWrapper = require("./GridPanelWrapper");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
function GridColumnsPanel(props) {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridPanelWrapper.GridPanelWrapper, (0, _extends2.default)({}, props, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.columnsManagement, (0, _extends2.default)({}, rootProps.slotProps?.columnsManagement))
  }));
}