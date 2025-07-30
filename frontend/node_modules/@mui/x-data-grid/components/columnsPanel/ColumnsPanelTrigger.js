"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ColumnsPanelTrigger = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _GridPanelContext = require("../panel/GridPanelContext");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _hooks = require("../../hooks");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "className", "onClick", "onPointerUp"];
/**
 * A button that opens and closes the columns panel.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Columns Panel](https://mui.com/x/react-data-grid/components/columns-panel/)
 *
 * API:
 *
 * - [ColumnsPanelTrigger API](https://mui.com/x/api/data-grid/columns-panel-trigger/)
 */
const ColumnsPanelTrigger = exports.ColumnsPanelTrigger = (0, _forwardRef.forwardRef)(function ColumnsPanelTrigger(props, ref) {
  const {
      render,
      className,
      onClick,
      onPointerUp
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const buttonId = (0, _useId.default)();
  const panelId = (0, _useId.default)();
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const panelState = (0, _hooks.useGridSelector)(apiRef, _hooks.gridPreferencePanelStateSelector);
  const open = panelState.open && panelState.openedPanelValue === _hooks.GridPreferencePanelsValue.columns;
  const state = {
    open
  };
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const {
    columnsPanelTriggerRef
  } = (0, _GridPanelContext.useGridPanelContext)();
  const handleRef = (0, _useForkRef.default)(ref, columnsPanelTriggerRef);
  const handleClick = event => {
    if (open) {
      apiRef.current.hidePreferences();
    } else {
      apiRef.current.showPreferences(_hooks.GridPreferencePanelsValue.columns, panelId, buttonId);
    }
    onClick?.(event);
  };
  const handlePointerUp = event => {
    if (open) {
      event.stopPropagation();
    }
    onPointerUp?.(event);
  };
  const element = (0, _useComponentRenderer.useComponentRenderer)(rootProps.slots.baseButton, render, (0, _extends2.default)({}, rootProps.slotProps?.baseButton, {
    id: buttonId,
    'aria-haspopup': 'true',
    'aria-expanded': open ? 'true' : undefined,
    'aria-controls': open ? panelId : undefined,
    className: resolvedClassName
  }, other, {
    onPointerUp: handlePointerUp,
    onClick: handleClick,
    ref: handleRef
  }), state);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ColumnsPanelTrigger.displayName = "ColumnsPanelTrigger";
process.env.NODE_ENV !== "production" ? ColumnsPanelTrigger.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  className: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string]),
  disabled: _propTypes.default.bool,
  id: _propTypes.default.string,
  /**
   * A function to customize rendering of the component.
   */
  render: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.func]),
  role: _propTypes.default.string,
  size: _propTypes.default.oneOf(['large', 'medium', 'small']),
  startIcon: _propTypes.default.node,
  style: _propTypes.default.object,
  tabIndex: _propTypes.default.number,
  title: _propTypes.default.string,
  touchRippleRef: _propTypes.default.any
} : void 0;