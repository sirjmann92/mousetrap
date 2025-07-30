"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbar = GridToolbar;
exports.GridToolbarDivider = GridToolbarDivider;
exports.GridToolbarLabel = GridToolbarLabel;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _system = require("@mui/system");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _GridMenu = require("../menu/GridMenu");
var _Toolbar = require("./Toolbar");
var _ToolbarButton = require("./ToolbarButton");
var _filterPanel = require("../filterPanel");
var _columnsPanel = require("../columnsPanel");
var _export = require("../export");
var _GridToolbarQuickFilter = require("../toolbar/GridToolbarQuickFilter");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _assert = require("../../utils/assert");
var _cssVariables = require("../../constants/cssVariables");
var _gridClasses = require("../../constants/gridClasses");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className"],
  _excluded2 = ["className"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    divider: ['toolbarDivider'],
    label: ['toolbarLabel']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const Divider = (0, _system.styled)(_assert.NotRendered, {
  name: 'MuiDataGrid',
  slot: 'ToolbarDivider'
})({
  height: '50%',
  margin: _cssVariables.vars.spacing(0, 0.5)
});
const Label = (0, _system.styled)('span', {
  name: 'MuiDataGrid',
  slot: 'ToolbarLabel'
})({
  flex: 1,
  font: _cssVariables.vars.typography.font.large,
  fontWeight: _cssVariables.vars.typography.fontWeight.medium,
  margin: _cssVariables.vars.spacing(0, 0.5),
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap'
});
function GridToolbarDivider(props) {
  const other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Divider, (0, _extends2.default)({
    as: rootProps.slots.baseDivider,
    orientation: "vertical",
    className: classes.divider
  }, other));
}
process.env.NODE_ENV !== "production" ? GridToolbarDivider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: _propTypes.default.string,
  orientation: _propTypes.default.oneOf(['horizontal', 'vertical'])
} : void 0;
function GridToolbarLabel(props) {
  const other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded2);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Label, (0, _extends2.default)({
    className: classes.label
  }, other));
}
function GridToolbar(props) {
  const {
    showQuickFilter = true,
    quickFilterProps,
    csvOptions,
    printOptions,
    additionalItems,
    additionalExportMenuItems
  } = props;
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
  const exportMenuTriggerRef = React.useRef(null);
  const exportMenuId = (0, _useId.default)();
  const exportMenuTriggerId = (0, _useId.default)();
  const showExportMenu = !csvOptions?.disableToolbarButton || !printOptions?.disableToolbarButton || additionalExportMenuItems;
  const closeExportMenu = () => setExportMenuOpen(false);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Toolbar.Toolbar, {
    children: [rootProps.label && /*#__PURE__*/(0, _jsxRuntime.jsx)(GridToolbarLabel, {
      children: rootProps.label
    }), !rootProps.disableColumnSelector && /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, {
      title: apiRef.current.getLocaleText('toolbarColumns'),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_columnsPanel.ColumnsPanelTrigger, {
        render: /*#__PURE__*/(0, _jsxRuntime.jsx)(_ToolbarButton.ToolbarButton, {}),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.columnSelectorIcon, {
          fontSize: "small"
        })
      })
    }), !rootProps.disableColumnFilter && /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, {
      title: apiRef.current.getLocaleText('toolbarFilters'),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_filterPanel.FilterPanelTrigger, {
        render: (triggerProps, state) => /*#__PURE__*/(0, _jsxRuntime.jsx)(_ToolbarButton.ToolbarButton, (0, _extends2.default)({}, triggerProps, {
          color: state.filterCount > 0 ? 'primary' : 'default',
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseBadge, {
            badgeContent: state.filterCount,
            color: "primary",
            variant: "dot",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.openFilterButtonIcon, {
              fontSize: "small"
            })
          })
        }))
      })
    }), additionalItems, showExportMenu && (!rootProps.disableColumnFilter || !rootProps.disableColumnSelector) && /*#__PURE__*/(0, _jsxRuntime.jsx)(GridToolbarDivider, {}), showExportMenu && /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, {
        title: apiRef.current.getLocaleText('toolbarExport'),
        disableInteractive: exportMenuOpen,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_ToolbarButton.ToolbarButton, {
          ref: exportMenuTriggerRef,
          id: exportMenuTriggerId,
          "aria-controls": exportMenuId,
          "aria-haspopup": "true",
          "aria-expanded": exportMenuOpen ? 'true' : undefined,
          onClick: () => setExportMenuOpen(!exportMenuOpen),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.exportIcon, {
            fontSize: "small"
          })
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridMenu.GridMenu, {
        target: exportMenuTriggerRef.current,
        open: exportMenuOpen,
        onClose: closeExportMenu,
        position: "bottom-end",
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(rootProps.slots.baseMenuList, (0, _extends2.default)({
          id: exportMenuId,
          "aria-labelledby": exportMenuTriggerId,
          autoFocusItem: true
        }, rootProps.slotProps?.baseMenuList, {
          children: [!printOptions?.disableToolbarButton && /*#__PURE__*/(0, _jsxRuntime.jsx)(_export.ExportPrint, {
            render: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, (0, _extends2.default)({}, rootProps.slotProps?.baseMenuItem)),
            options: printOptions,
            onClick: closeExportMenu,
            children: apiRef.current.getLocaleText('toolbarExportPrint')
          }), !csvOptions?.disableToolbarButton && /*#__PURE__*/(0, _jsxRuntime.jsx)(_export.ExportCsv, {
            render: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, (0, _extends2.default)({}, rootProps.slotProps?.baseMenuItem)),
            options: csvOptions,
            onClick: closeExportMenu,
            children: apiRef.current.getLocaleText('toolbarExportCSV')
          }), additionalExportMenuItems?.(closeExportMenu)]
        }))
      })]
    }), showQuickFilter && /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(GridToolbarDivider, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbarQuickFilter.GridToolbarQuickFilter, (0, _extends2.default)({}, quickFilterProps))]
    })]
  });
}
process.env.NODE_ENV !== "production" ? GridToolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  additionalExportMenuItems: _propTypes.default.func,
  additionalItems: _propTypes.default.node,
  csvOptions: _propTypes.default.object,
  printOptions: _propTypes.default.object,
  /**
   * Props passed to the quick filter component.
   */
  quickFilterProps: _propTypes.default.shape({
    className: _propTypes.default.string,
    debounceMs: _propTypes.default.number,
    quickFilterFormatter: _propTypes.default.func,
    quickFilterParser: _propTypes.default.func,
    slotProps: _propTypes.default.object
  }),
  /**
   * Show the quick filter component.
   * @default true
   */
  showQuickFilter: _propTypes.default.bool,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: _propTypes.default.object,
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;