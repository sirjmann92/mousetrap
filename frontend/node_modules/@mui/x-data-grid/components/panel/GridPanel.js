"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridPanelClasses = exports.GridPanel = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _styles = require("@mui/material/styles");
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _cssVariables = require("../../constants/cssVariables");
var _context = require("../../utils/css/context");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _assert = require("../../utils/assert");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["children", "className", "classes", "onClose"];
const gridPanelClasses = exports.gridPanelClasses = (0, _generateUtilityClasses.default)('MuiDataGrid', ['panel', 'paper']);
const GridPanelRoot = (0, _styles.styled)(_assert.NotRendered, {
  name: 'MuiDataGrid',
  slot: 'panel'
})({
  zIndex: _cssVariables.vars.zIndex.panel
});
const GridPanelContent = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'panelContent'
})({
  backgroundColor: _cssVariables.vars.colors.background.overlay,
  borderRadius: _cssVariables.vars.radius.base,
  boxShadow: _cssVariables.vars.shadows.overlay,
  display: 'flex',
  maxWidth: `calc(100vw - ${_cssVariables.vars.spacing(2)})`,
  overflow: 'auto'
});
const GridPanel = exports.GridPanel = (0, _forwardRef.forwardRef)((props, ref) => {
  const {
      children,
      className,
      onClose
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = gridPanelClasses;
  const [isPlaced, setIsPlaced] = React.useState(false);
  const variablesClass = (0, _context.useCSSVariablesClass)();
  const onDidShow = (0, _useEventCallback.default)(() => setIsPlaced(true));
  const onDidHide = (0, _useEventCallback.default)(() => setIsPlaced(false));
  const handleClickAway = (0, _useEventCallback.default)(() => {
    onClose?.();
  });
  const handleKeyDown = (0, _useEventCallback.default)(event => {
    if (event.key === 'Escape') {
      onClose?.();
    }
  });
  const [fallbackTarget, setFallbackTarget] = React.useState(null);
  React.useEffect(() => {
    const panelAnchor = apiRef.current.rootElementRef?.current?.querySelector('[data-id="gridPanelAnchor"]');
    if (panelAnchor) {
      setFallbackTarget(panelAnchor);
    }
  }, [apiRef]);
  if (!fallbackTarget) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridPanelRoot, (0, _extends2.default)({
    as: rootProps.slots.basePopper,
    ownerState: rootProps,
    placement: "bottom-end",
    className: (0, _clsx.default)(classes.panel, className, variablesClass),
    flip: true,
    onDidShow: onDidShow,
    onDidHide: onDidHide,
    onClickAway: handleClickAway,
    clickAwayMouseEvent: "onPointerUp",
    clickAwayTouchEvent: false,
    focusTrap: true
  }, other, rootProps.slotProps?.basePopper, {
    target: props.target ?? fallbackTarget,
    ref: ref,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(GridPanelContent, {
      className: classes.paper,
      ownerState: rootProps,
      onKeyDown: handleKeyDown,
      children: isPlaced && children
    })
  }));
});
if (process.env.NODE_ENV !== "production") GridPanel.displayName = "GridPanel";
process.env.NODE_ENV !== "production" ? GridPanel.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: _propTypes.default.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  className: _propTypes.default.string,
  flip: _propTypes.default.bool,
  id: _propTypes.default.string,
  onClose: _propTypes.default.func,
  open: _propTypes.default.bool.isRequired,
  target: _propTypes.default /* @typescript-to-proptypes-ignore */.any
} : void 0;