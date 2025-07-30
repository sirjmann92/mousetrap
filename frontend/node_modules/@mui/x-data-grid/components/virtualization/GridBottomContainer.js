"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridBottomContainer = GridBottomContainer;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _system = require("@mui/system");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _gridClasses = require("../../constants/gridClasses");
var _jsxRuntime = require("react/jsx-runtime");
const useUtilityClasses = () => {
  const slots = {
    root: ['bottomContainer']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, {});
};
const Element = (0, _system.styled)('div')({
  position: 'sticky',
  zIndex: 40,
  bottom: 'calc(var(--DataGrid-hasScrollX) * var(--DataGrid-scrollbarSize))'
});
function GridBottomContainer(props) {
  const classes = useUtilityClasses();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Element, (0, _extends2.default)({}, props, {
    className: (0, _clsx.default)(classes.root, _gridClasses.gridClasses['container--bottom']),
    role: "presentation"
  }));
}