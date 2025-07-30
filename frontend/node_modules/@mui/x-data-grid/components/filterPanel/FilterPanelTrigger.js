"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilterPanelTrigger = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _GridPanelContext = require("../panel/GridPanelContext");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _hooks = require("../../hooks");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "className", "onClick", "onPointerUp"];
/**
 * A button that opens and closes the filter panel.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Filter Panel](https://mui.com/x/react-data-grid/components/filter-panel/)
 *
 * API:
 *
 * - [FilterPanelTrigger API](https://mui.com/x/api/data-grid/filter-panel-trigger/)
 */
const FilterPanelTrigger = exports.FilterPanelTrigger = (0, _forwardRef.forwardRef)(function FilterPanelTrigger(props, ref) {
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
  const open = panelState.open && panelState.openedPanelValue === _hooks.GridPreferencePanelsValue.filters;
  const activeFilters = (0, _hooks.useGridSelector)(apiRef, _hooks.gridFilterActiveItemsSelector);
  const filterCount = activeFilters.length;
  const state = {
    open,
    filterCount
  };
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const {
    filterPanelTriggerRef
  } = (0, _GridPanelContext.useGridPanelContext)();
  const handleRef = (0, _useForkRef.default)(ref, filterPanelTriggerRef);
  const handleClick = event => {
    if (open) {
      apiRef.current.hidePreferences();
    } else {
      apiRef.current.showPreferences(_hooks.GridPreferencePanelsValue.filters, panelId, buttonId);
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
    onClick: handleClick,
    onPointerUp: handlePointerUp,
    className: resolvedClassName
  }, other, {
    ref: handleRef
  }), state);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") FilterPanelTrigger.displayName = "FilterPanelTrigger";
process.env.NODE_ENV !== "production" ? FilterPanelTrigger.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * A function to customize rendering of the component.
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