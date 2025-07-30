"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridCsvExportMenuItem = GridCsvExportMenuItem;
exports.GridPrintExportMenuItem = GridPrintExportMenuItem;
exports.GridToolbarExport = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _GridToolbarExportContainer = require("./GridToolbarExportContainer");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["hideMenu", "options"],
  _excluded2 = ["hideMenu", "options"],
  _excluded3 = ["csvOptions", "printOptions", "excelOptions"];
function GridCsvExportMenuItem(props) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
      hideMenu,
      options
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, (0, _extends2.default)({
    onClick: () => {
      apiRef.current.exportDataAsCsv(options);
      hideMenu?.();
    }
  }, other, {
    children: apiRef.current.getLocaleText('toolbarExportCSV')
  }));
}
process.env.NODE_ENV !== "production" ? GridCsvExportMenuItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  hideMenu: _propTypes.default.func,
  options: _propTypes.default.shape({
    allColumns: _propTypes.default.bool,
    delimiter: _propTypes.default.string,
    disableToolbarButton: _propTypes.default.bool,
    escapeFormulas: _propTypes.default.bool,
    fields: _propTypes.default.arrayOf(_propTypes.default.string),
    fileName: _propTypes.default.string,
    getRowsToExport: _propTypes.default.func,
    includeColumnGroupsHeaders: _propTypes.default.bool,
    includeHeaders: _propTypes.default.bool,
    shouldAppendQuotes: _propTypes.default.bool,
    utf8WithBom: _propTypes.default.bool
  })
} : void 0;
function GridPrintExportMenuItem(props) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
      hideMenu,
      options
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded2);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, (0, _extends2.default)({
    onClick: () => {
      apiRef.current.exportDataAsPrint(options);
      hideMenu?.();
    }
  }, other, {
    children: apiRef.current.getLocaleText('toolbarExportPrint')
  }));
}
process.env.NODE_ENV !== "production" ? GridPrintExportMenuItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  hideMenu: _propTypes.default.func,
  options: _propTypes.default.shape({
    allColumns: _propTypes.default.bool,
    bodyClassName: _propTypes.default.string,
    copyStyles: _propTypes.default.bool,
    disableToolbarButton: _propTypes.default.bool,
    fields: _propTypes.default.arrayOf(_propTypes.default.string),
    fileName: _propTypes.default.string,
    getRowsToExport: _propTypes.default.func,
    hideFooter: _propTypes.default.bool,
    hideToolbar: _propTypes.default.bool,
    includeCheckboxes: _propTypes.default.bool,
    pageStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string])
  })
} : void 0;

/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/export/ Export} components instead. This component will be removed in a future major release.
 */
const GridToolbarExport = exports.GridToolbarExport = (0, _forwardRef.forwardRef)(function GridToolbarExport(props, ref) {
  const _ref = props,
    {
      csvOptions = {},
      printOptions = {},
      excelOptions
    } = _ref,
    other = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded3);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const preProcessedButtons = apiRef.current.unstable_applyPipeProcessors('exportMenu', [], {
    excelOptions,
    csvOptions,
    printOptions
  }).sort((a, b) => a.componentName > b.componentName ? 1 : -1);
  if (preProcessedButtons.length === 0) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbarExportContainer.GridToolbarExportContainer, (0, _extends2.default)({}, other, {
    ref: ref,
    children: preProcessedButtons.map((button, index) => /*#__PURE__*/React.cloneElement(button.component, {
      key: index
    }))
  }));
});
if (process.env.NODE_ENV !== "production") GridToolbarExport.displayName = "GridToolbarExport";
process.env.NODE_ENV !== "production" ? GridToolbarExport.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  csvOptions: _propTypes.default.object,
  printOptions: _propTypes.default.object,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: _propTypes.default.object
} : void 0;