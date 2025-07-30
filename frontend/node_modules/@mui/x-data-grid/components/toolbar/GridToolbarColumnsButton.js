"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbarColumnsButton = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _gridPreferencePanelSelector = require("../../hooks/features/preferencesPanel/gridPreferencePanelSelector");
var _gridPreferencePanelsValue = require("../../hooks/features/preferencesPanel/gridPreferencePanelsValue");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _GridPanelContext = require("../panel/GridPanelContext");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/columns-panel/ Columns Panel Trigger} component instead. This component will be removed in a future major release.
 */
const GridToolbarColumnsButton = exports.GridToolbarColumnsButton = (0, _forwardRef.forwardRef)(function GridToolbarColumnsButton(props, ref) {
  const {
    slotProps = {}
  } = props;
  const buttonProps = slotProps.button || {};
  const tooltipProps = slotProps.tooltip || {};
  const columnButtonId = (0, _useId.default)();
  const columnPanelId = (0, _useId.default)();
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
    columnsPanelTriggerRef
  } = (0, _GridPanelContext.useGridPanelContext)();
  const preferencePanel = (0, _useGridSelector.useGridSelector)(apiRef, _gridPreferencePanelSelector.gridPreferencePanelStateSelector);
  const handleRef = (0, _useForkRef.default)(ref, columnsPanelTriggerRef);
  const showColumns = event => {
    if (preferencePanel.open && preferencePanel.openedPanelValue === _gridPreferencePanelsValue.GridPreferencePanelsValue.columns) {
      apiRef.current.hidePreferences();
    } else {
      apiRef.current.showPreferences(_gridPreferencePanelsValue.GridPreferencePanelsValue.columns, columnPanelId, columnButtonId);
    }
    buttonProps.onClick?.(event);
  };

  // Disable the button if the corresponding is disabled
  if (rootProps.disableColumnSelector) {
    return null;
  }
  const isOpen = preferencePanel.open && preferencePanel.panelId === columnPanelId;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, (0, _extends2.default)({
    title: apiRef.current.getLocaleText('toolbarColumnsLabel'),
    enterDelay: 1000
  }, rootProps.slotProps?.baseTooltip, tooltipProps, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseButton, (0, _extends2.default)({
      id: columnButtonId,
      size: "small",
      "aria-label": apiRef.current.getLocaleText('toolbarColumnsLabel'),
      "aria-haspopup": "menu",
      "aria-expanded": isOpen,
      "aria-controls": isOpen ? columnPanelId : undefined,
      startIcon: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.columnSelectorIcon, {})
    }, rootProps.slotProps?.baseButton, buttonProps, {
      onPointerUp: event => {
        if (preferencePanel.open) {
          event.stopPropagation();
        }
        buttonProps.onPointerUp?.(event);
      },
      onClick: showColumns,
      ref: handleRef,
      children: apiRef.current.getLocaleText('toolbarColumns')
    }))
  }));
});
if (process.env.NODE_ENV !== "production") GridToolbarColumnsButton.displayName = "GridToolbarColumnsButton";
process.env.NODE_ENV !== "production" ? GridToolbarColumnsButton.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: _propTypes.default.object
} : void 0;