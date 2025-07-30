"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbarFilterButton = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _capitalize = _interopRequireDefault(require("@mui/utils/capitalize"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _cssVariables = require("../../constants/cssVariables");
var _gridColumnsSelector = require("../../hooks/features/columns/gridColumnsSelector");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _gridFilterSelector = require("../../hooks/features/filter/gridFilterSelector");
var _gridPreferencePanelSelector = require("../../hooks/features/preferencesPanel/gridPreferencePanelSelector");
var _gridPreferencePanelsValue = require("../../hooks/features/preferencesPanel/gridPreferencePanelsValue");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../constants/gridClasses");
var _GridPanelContext = require("../panel/GridPanelContext");
var _jsxRuntime = require("react/jsx-runtime");
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['toolbarFilterList']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridToolbarFilterListRoot = (0, _styles.styled)('ul', {
  name: 'MuiDataGrid',
  slot: 'ToolbarFilterList'
})({
  margin: _cssVariables.vars.spacing(1, 1, 0.5),
  padding: _cssVariables.vars.spacing(0, 1)
});
/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/filter-panel/ Filter Panel Trigger} component instead. This component will be removed in a future major release.
 */
const GridToolbarFilterButton = exports.GridToolbarFilterButton = (0, _forwardRef.forwardRef)(function GridToolbarFilterButton(props, ref) {
  const {
    slotProps = {}
  } = props;
  const buttonProps = slotProps.button || {};
  const tooltipProps = slotProps.tooltip || {};
  const badgeProps = slotProps.badge || {};
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const activeFilters = (0, _useGridSelector.useGridSelector)(apiRef, _gridFilterSelector.gridFilterActiveItemsSelector);
  const lookup = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnsSelector.gridColumnLookupSelector);
  const preferencePanel = (0, _useGridSelector.useGridSelector)(apiRef, _gridPreferencePanelSelector.gridPreferencePanelStateSelector);
  const classes = useUtilityClasses(rootProps);
  const filterButtonId = (0, _useId.default)();
  const filterPanelId = (0, _useId.default)();
  const {
    filterPanelTriggerRef
  } = (0, _GridPanelContext.useGridPanelContext)();
  const handleRef = (0, _useForkRef.default)(ref, filterPanelTriggerRef);
  const tooltipContentNode = React.useMemo(() => {
    if (preferencePanel.open) {
      return apiRef.current.getLocaleText('toolbarFiltersTooltipHide');
    }
    if (activeFilters.length === 0) {
      return apiRef.current.getLocaleText('toolbarFiltersTooltipShow');
    }
    const getOperatorLabel = item => lookup[item.field].filterOperators.find(operator => operator.value === item.operator).label || apiRef.current.getLocaleText(`filterOperator${(0, _capitalize.default)(item.operator)}`).toString();
    const getFilterItemValue = item => {
      const {
        getValueAsString
      } = lookup[item.field].filterOperators.find(operator => operator.value === item.operator);
      return getValueAsString ? getValueAsString(item.value) : item.value;
    };
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [apiRef.current.getLocaleText('toolbarFiltersTooltipActive')(activeFilters.length), /*#__PURE__*/(0, _jsxRuntime.jsx)(GridToolbarFilterListRoot, {
        className: classes.root,
        ownerState: rootProps,
        children: activeFilters.map((item, index) => (0, _extends2.default)({}, lookup[item.field] && /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
          children: `${lookup[item.field].headerName || item.field}
                  ${getOperatorLabel(item)}
                  ${
          // implicit check for null and undefined
          item.value != null ? getFilterItemValue(item) : ''}`
        }, index)))
      })]
    });
  }, [apiRef, rootProps, preferencePanel.open, activeFilters, lookup, classes]);
  const toggleFilter = event => {
    const {
      open,
      openedPanelValue
    } = preferencePanel;
    if (open && openedPanelValue === _gridPreferencePanelsValue.GridPreferencePanelsValue.filters) {
      apiRef.current.hidePreferences();
    } else {
      apiRef.current.showPreferences(_gridPreferencePanelsValue.GridPreferencePanelsValue.filters, filterPanelId, filterButtonId);
    }
    buttonProps.onClick?.(event);
  };

  // Disable the button if the corresponding is disabled
  if (rootProps.disableColumnFilter) {
    return null;
  }
  const isOpen = preferencePanel.open && preferencePanel.panelId === filterPanelId;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, (0, _extends2.default)({
    title: tooltipContentNode,
    enterDelay: 1000
  }, rootProps.slotProps?.baseTooltip, tooltipProps, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseButton, (0, _extends2.default)({
      id: filterButtonId,
      size: "small",
      "aria-label": apiRef.current.getLocaleText('toolbarFiltersLabel'),
      "aria-controls": isOpen ? filterPanelId : undefined,
      "aria-expanded": isOpen,
      "aria-haspopup": true,
      startIcon: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseBadge, (0, _extends2.default)({
        badgeContent: activeFilters.length,
        color: "primary"
      }, rootProps.slotProps?.baseBadge, badgeProps, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.openFilterButtonIcon, {})
      }))
    }, rootProps.slotProps?.baseButton, buttonProps, {
      onClick: toggleFilter,
      onPointerUp: event => {
        if (preferencePanel.open) {
          event.stopPropagation();
        }
        buttonProps.onPointerUp?.(event);
      },
      ref: handleRef,
      children: apiRef.current.getLocaleText('toolbarFilters')
    }))
  }));
});
if (process.env.NODE_ENV !== "production") GridToolbarFilterButton.displayName = "GridToolbarFilterButton";
process.env.NODE_ENV !== "production" ? GridToolbarFilterButton.propTypes = {
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