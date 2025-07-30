"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnHeaderSortIcon = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _GridIconButtonContainer = require("./GridIconButtonContainer");
var _GridColumnSortButton = require("../GridColumnSortButton");
var _jsxRuntime = require("react/jsx-runtime");
function GridColumnHeaderSortIconRaw(props) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridIconButtonContainer.GridIconButtonContainer, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridColumnSortButton.GridColumnSortButton, (0, _extends2.default)({}, props, {
      tabIndex: -1
    }))
  });
}
const GridColumnHeaderSortIcon = exports.GridColumnHeaderSortIcon = /*#__PURE__*/React.memo(GridColumnHeaderSortIconRaw);
if (process.env.NODE_ENV !== "production") GridColumnHeaderSortIcon.displayName = "GridColumnHeaderSortIcon";
process.env.NODE_ENV !== "production" ? GridColumnHeaderSortIconRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: _propTypes.default.string,
  color: _propTypes.default.oneOf(['default', 'inherit', 'primary']),
  direction: _propTypes.default.oneOf(['asc', 'desc']),
  disabled: _propTypes.default.bool,
  edge: _propTypes.default.oneOf(['end', 'start', false]),
  field: _propTypes.default.string.isRequired,
  id: _propTypes.default.string,
  index: _propTypes.default.number,
  label: _propTypes.default.string,
  role: _propTypes.default.string,
  size: _propTypes.default.oneOf(['large', 'medium', 'small']),
  sortingOrder: _propTypes.default.arrayOf(_propTypes.default.oneOf(['asc', 'desc'])).isRequired,
  style: _propTypes.default.object,
  tabIndex: _propTypes.default.number,
  title: _propTypes.default.string,
  touchRippleRef: _propTypes.default.any
} : void 0;