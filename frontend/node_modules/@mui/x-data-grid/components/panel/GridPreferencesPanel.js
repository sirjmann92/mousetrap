"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridPreferencesPanel = GridPreferencesPanel;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _gridColumnsSelector = require("../../hooks/features/columns/gridColumnsSelector");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _gridPreferencePanelSelector = require("../../hooks/features/preferencesPanel/gridPreferencePanelSelector");
var _gridPreferencePanelsValue = require("../../hooks/features/preferencesPanel/gridPreferencePanelsValue");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _GridPanelContext = require("./GridPanelContext");
var _jsxRuntime = require("react/jsx-runtime");
function GridPreferencesPanel() {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const columns = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnsSelector.gridColumnDefinitionsSelector);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const preferencePanelState = (0, _useGridSelector.useGridSelector)(apiRef, _gridPreferencePanelSelector.gridPreferencePanelStateSelector);
  const {
    columnsPanelTriggerRef,
    filterPanelTriggerRef,
    aiAssistantPanelTriggerRef
  } = (0, _GridPanelContext.useGridPanelContext)();
  const panelContent = apiRef.current.unstable_applyPipeProcessors('preferencePanel', null, preferencePanelState.openedPanelValue ?? _gridPreferencePanelsValue.GridPreferencePanelsValue.filters);
  let target = null;
  switch (preferencePanelState.openedPanelValue) {
    case _gridPreferencePanelsValue.GridPreferencePanelsValue.filters:
      target = filterPanelTriggerRef.current;
      break;
    case _gridPreferencePanelsValue.GridPreferencePanelsValue.columns:
      target = columnsPanelTriggerRef.current;
      break;
    case _gridPreferencePanelsValue.GridPreferencePanelsValue.aiAssistant:
      target = aiAssistantPanelTriggerRef.current;
      break;
    default:
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.panel, (0, _extends2.default)({
    id: preferencePanelState.panelId,
    open: columns.length > 0 && preferencePanelState.open,
    "aria-labelledby": preferencePanelState.labelId,
    target: target,
    onClose: () => apiRef.current.hidePreferences()
  }, rootProps.slotProps?.panel, {
    children: panelContent
  }));
}