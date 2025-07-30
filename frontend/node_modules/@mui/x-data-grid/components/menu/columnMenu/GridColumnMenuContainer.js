"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnMenuContainer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _clsx = _interopRequireDefault(require("clsx"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var React = _interopRequireWildcard(require("react"));
var _styles = require("@mui/material/styles");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _keyboardUtils = require("../../../utils/keyboardUtils");
var _assert = require("../../../utils/assert");
var _gridClasses = require("../../../constants/gridClasses");
var _useGridRootProps = require("../../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["hideMenu", "colDef", "id", "labelledby", "className", "children", "open"];
const StyledMenuList = (0, _styles.styled)(_assert.NotRendered)(() => ({
  minWidth: 248
}));
function handleMenuScrollCapture(event) {
  if (!event.currentTarget.contains(event.target)) {
    return;
  }
  event.stopPropagation();
}
const GridColumnMenuContainer = exports.GridColumnMenuContainer = (0, _forwardRef.forwardRef)(function GridColumnMenuContainer(props, ref) {
  const {
      hideMenu,
      id,
      labelledby,
      className,
      children,
      open
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const handleListKeyDown = React.useCallback(event => {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
    if ((0, _keyboardUtils.isHideMenuKey)(event.key)) {
      hideMenu(event);
    }
  }, [hideMenu]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(StyledMenuList, (0, _extends2.default)({
    as: rootProps.slots.baseMenuList,
    id: id,
    className: (0, _clsx.default)(_gridClasses.gridClasses.menuList, className),
    "aria-labelledby": labelledby,
    onKeyDown: handleListKeyDown,
    onWheel: handleMenuScrollCapture,
    onTouchMove: handleMenuScrollCapture,
    autoFocus: open
  }, other, {
    ref: ref,
    children: children
  }));
});
if (process.env.NODE_ENV !== "production") GridColumnMenuContainer.displayName = "GridColumnMenuContainer";
process.env.NODE_ENV !== "production" ? GridColumnMenuContainer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: _propTypes.default.object.isRequired,
  hideMenu: _propTypes.default.func.isRequired,
  id: _propTypes.default.string,
  labelledby: _propTypes.default.string,
  open: _propTypes.default.bool.isRequired
} : void 0;