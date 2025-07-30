"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnUnsortedIcon = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["sortingOrder"];
const GridColumnUnsortedIcon = exports.GridColumnUnsortedIcon = /*#__PURE__*/React.memo(function GridColumnHeaderSortIcon(props) {
  const {
      sortingOrder
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const [nextSortDirection] = sortingOrder;
  const Icon = nextSortDirection === 'asc' ? rootProps.slots.columnSortedAscendingIcon : rootProps.slots.columnSortedDescendingIcon;
  return Icon ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Icon, (0, _extends2.default)({}, other)) : null;
});
if (process.env.NODE_ENV !== "production") GridColumnUnsortedIcon.displayName = "GridColumnUnsortedIcon";