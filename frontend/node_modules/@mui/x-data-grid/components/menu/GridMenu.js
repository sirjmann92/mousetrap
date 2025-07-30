"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridMenu = GridMenu;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _HTMLElementType = _interopRequireDefault(require("@mui/utils/HTMLElementType"));
var _styles = require("@mui/material/styles");
var _keyboardUtils = require("../../utils/keyboardUtils");
var _cssVariables = require("../../constants/cssVariables");
var _context = require("../../utils/css/context");
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _assert = require("../../utils/assert");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["open", "target", "onClose", "children", "position", "className", "onExited"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['menu']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridMenuRoot = (0, _styles.styled)(_assert.NotRendered, {
  name: 'MuiDataGrid',
  slot: 'Menu'
})({
  zIndex: _cssVariables.vars.zIndex.menu,
  [`& .${_gridClasses.gridClasses.menuList}`]: {
    outline: 0
  }
});
function GridMenu(props) {
  const {
      open,
      target,
      onClose,
      children,
      position,
      className,
      onExited
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  const variablesClass = (0, _context.useCSSVariablesClass)();
  const savedFocusRef = React.useRef(null);
  (0, _useEnhancedEffect.default)(() => {
    if (open) {
      savedFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    } else {
      savedFocusRef.current?.focus?.();
      savedFocusRef.current = null;
    }
  }, [open]);
  React.useEffect(() => {
    // Emit menuOpen or menuClose events
    const eventName = open ? 'menuOpen' : 'menuClose';
    apiRef.current.publishEvent(eventName, {
      target
    });
  }, [apiRef, open, target]);
  const handleClickAway = event => {
    if (event.target && (target === event.target || target?.contains(event.target))) {
      return;
    }
    onClose(event);
  };
  const handleKeyDown = event => {
    if ((0, _keyboardUtils.isHideMenuKey)(event.key)) {
      onClose(event);
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridMenuRoot, (0, _extends2.default)({
    as: rootProps.slots.basePopper,
    className: (0, _clsx.default)(classes.root, className, variablesClass),
    ownerState: rootProps,
    open: open,
    target: target,
    transition: true,
    placement: position,
    onClickAway: handleClickAway,
    onExited: onExited,
    clickAwayMouseEvent: "onMouseDown",
    onKeyDown: handleKeyDown
  }, other, rootProps.slotProps?.basePopper, {
    children: children
  }));
}
process.env.NODE_ENV !== "production" ? GridMenu.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: _propTypes.default.node,
  className: _propTypes.default.string,
  onClose: _propTypes.default.func.isRequired,
  onExited: _propTypes.default.func,
  open: _propTypes.default.bool.isRequired,
  position: _propTypes.default.oneOf(['bottom-end', 'bottom-start', 'bottom', 'left-end', 'left-start', 'left', 'right-end', 'right-start', 'right', 'top-end', 'top-start', 'top']),
  target: _HTMLElementType.default
} : void 0;