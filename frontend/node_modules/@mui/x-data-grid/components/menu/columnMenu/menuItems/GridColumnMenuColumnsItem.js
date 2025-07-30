"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnMenuColumnsItem = GridColumnMenuColumnsItem;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _GridColumnMenuHideItem = require("./GridColumnMenuHideItem");
var _GridColumnMenuManageItem = require("./GridColumnMenuManageItem");
var _jsxRuntime = require("react/jsx-runtime");
function GridColumnMenuColumnsItem(props) {
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_GridColumnMenuHideItem.GridColumnMenuHideItem, (0, _extends2.default)({}, props)), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridColumnMenuManageItem.GridColumnMenuManageItem, (0, _extends2.default)({}, props))]
  });
}
process.env.NODE_ENV !== "production" ? GridColumnMenuColumnsItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: _propTypes.default.object.isRequired,
  onClick: _propTypes.default.func.isRequired
} : void 0;