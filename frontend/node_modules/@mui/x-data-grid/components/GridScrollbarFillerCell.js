"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridScrollbarFillerCell = GridScrollbarFillerCell;
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _constants = require("../constants");
var _jsxRuntime = require("react/jsx-runtime");
const classes = {
  root: _constants.gridClasses.scrollbarFiller,
  header: _constants.gridClasses['scrollbarFiller--header'],
  borderTop: _constants.gridClasses['scrollbarFiller--borderTop'],
  borderBottom: _constants.gridClasses['scrollbarFiller--borderBottom'],
  pinnedRight: _constants.gridClasses['scrollbarFiller--pinnedRight']
};
function GridScrollbarFillerCell({
  header,
  borderTop = true,
  borderBottom,
  pinnedRight
}) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    role: "presentation",
    className: (0, _clsx.default)(classes.root, header && classes.header, borderTop && classes.borderTop, borderBottom && classes.borderBottom, pinnedRight && classes.pinnedRight)
  });
}