"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDataGridProps = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _styles = require("@mui/material/styles");
var _system = require("@mui/system");
var _constants = require("../constants");
var _defaultGridSlotsComponents = require("../constants/defaultGridSlotsComponents");
var _utils = require("../internals/utils");
var _dataGridPropsDefaultValues = require("../constants/dataGridPropsDefaultValues");
const DATA_GRID_FORCED_PROPS = {
  disableMultipleColumnsFiltering: true,
  disableMultipleColumnsSorting: true,
  throttleRowsMs: undefined,
  hideFooterRowCount: false,
  pagination: true,
  checkboxSelectionVisibleOnly: false,
  disableColumnReorder: true,
  keepColumnPositionIfDraggedOutside: false,
  signature: 'DataGrid',
  listView: false
};
const getDataGridForcedProps = themedProps => (0, _extends2.default)({}, DATA_GRID_FORCED_PROPS, themedProps.dataSource ? {
  filterMode: 'server',
  sortingMode: 'server',
  paginationMode: 'server'
} : {});
const defaultSlots = _defaultGridSlotsComponents.DATA_GRID_DEFAULT_SLOTS_COMPONENTS;
const useDataGridProps = inProps => {
  const theme = (0, _styles.useTheme)();
  const themedProps = React.useMemo(() => (0, _system.getThemeProps)({
    props: inProps,
    theme,
    name: 'MuiDataGrid'
  }), [theme, inProps]);
  const localeText = React.useMemo(() => (0, _extends2.default)({}, _constants.GRID_DEFAULT_LOCALE_TEXT, themedProps.localeText), [themedProps.localeText]);
  const slots = React.useMemo(() => (0, _utils.computeSlots)({
    defaultSlots,
    slots: themedProps.slots
  }), [themedProps.slots]);
  const injectDefaultProps = React.useMemo(() => {
    return Object.keys(_dataGridPropsDefaultValues.DATA_GRID_PROPS_DEFAULT_VALUES).reduce((acc, key) => {
      // @ts-ignore
      acc[key] = themedProps[key] ?? _dataGridPropsDefaultValues.DATA_GRID_PROPS_DEFAULT_VALUES[key];
      return acc;
    }, {});
  }, [themedProps]);
  return React.useMemo(() => (0, _extends2.default)({}, themedProps, injectDefaultProps, {
    localeText,
    slots
  }, getDataGridForcedProps(themedProps)), [themedProps, localeText, slots, injectDefaultProps]);
};
exports.useDataGridProps = useDataGridProps;