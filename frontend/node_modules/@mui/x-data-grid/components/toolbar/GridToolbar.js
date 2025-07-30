"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbar = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _GridToolbarContainer = require("../containers/GridToolbarContainer");
var _GridToolbarColumnsButton = require("./GridToolbarColumnsButton");
var _GridToolbarDensitySelector = require("./GridToolbarDensitySelector");
var _GridToolbarFilterButton = require("./GridToolbarFilterButton");
var _GridToolbarExport = require("./GridToolbarExport");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _GridToolbarQuickFilter = require("./GridToolbarQuickFilter");
var _GridToolbar2 = require("../toolbarV8/GridToolbar");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "csvOptions", "printOptions", "excelOptions", "showQuickFilter", "quickFilterProps"];
/**
 * @deprecated Use the `showToolbar` prop to show the default toolbar instead. This component will be removed in a future major release.
 */
const GridToolbar = exports.GridToolbar = (0, _forwardRef.forwardRef)(function GridToolbar(props, ref) {
  // TODO v7: think about where export option should be passed.
  // from slotProps={{ toolbarExport: { ...exportOption } }} seems to be more appropriate
  const _ref = props,
    {
      csvOptions,
      printOptions,
      excelOptions,
      showQuickFilter = true,
      quickFilterProps = {}
    } = _ref,
    other = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  if (rootProps.disableColumnFilter && rootProps.disableColumnSelector && rootProps.disableDensitySelector && !showQuickFilter) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_GridToolbarContainer.GridToolbarContainer, (0, _extends2.default)({}, other, {
    ref: ref,
    children: [rootProps.label && /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbar2.GridToolbarLabel, {
      children: rootProps.label
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbarColumnsButton.GridToolbarColumnsButton, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbarFilterButton.GridToolbarFilterButton, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbarDensitySelector.GridToolbarDensitySelector, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbarExport.GridToolbarExport, {
      csvOptions: csvOptions,
      printOptions: printOptions
      // @ts-ignore
      ,
      excelOptions: excelOptions
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      style: {
        flex: 1
      }
    }), showQuickFilter && /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridToolbarQuickFilter.GridToolbarQuickFilter, (0, _extends2.default)({}, quickFilterProps))]
  }));
});
if (process.env.NODE_ENV !== "production") GridToolbar.displayName = "GridToolbar";
process.env.NODE_ENV !== "production" ? GridToolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
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