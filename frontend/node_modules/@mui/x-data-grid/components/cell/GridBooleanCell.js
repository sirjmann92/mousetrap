"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderBooleanCell = exports.GridBooleanCell = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _gridRowsSelector = require("../../hooks/features/rows/gridRowsSelector");
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _gridRowsUtils = require("../../hooks/features/rows/gridRowsUtils");
var _constants = require("../../internals/constants");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["id", "value", "formattedValue", "api", "field", "row", "rowNode", "colDef", "cellMode", "isEditable", "hasFocus", "tabIndex", "hideDescendantCount"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['booleanCell']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
function GridBooleanCellRaw(props) {
  const {
      value,
      rowNode
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = {
    classes: rootProps.classes
  };
  const classes = useUtilityClasses(ownerState);
  const maxDepth = (0, _useGridSelector.useGridSelector)(apiRef, _gridRowsSelector.gridRowMaximumTreeDepthSelector);
  const isServerSideRowGroupingRow =
  // @ts-expect-error - Access tree data prop
  maxDepth > 0 && rowNode.type === 'group' && rootProps.treeData === false;
  const Icon = React.useMemo(() => value ? rootProps.slots.booleanCellTrueIcon : rootProps.slots.booleanCellFalseIcon, [rootProps.slots.booleanCellFalseIcon, rootProps.slots.booleanCellTrueIcon, value]);
  if (isServerSideRowGroupingRow && value === undefined) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Icon, (0, _extends2.default)({
    fontSize: "small",
    className: classes.root,
    titleAccess: apiRef.current.getLocaleText(value ? 'booleanCellTrueLabel' : 'booleanCellFalseLabel'),
    "data-value": Boolean(value)
  }, other));
}
process.env.NODE_ENV !== "production" ? GridBooleanCellRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * GridApi that let you manipulate the grid.
   */
  api: _propTypes.default.object.isRequired,
  /**
   * The mode of the cell.
   */
  cellMode: _propTypes.default.oneOf(['edit', 'view']).isRequired,
  /**
   * The column of the row that the current cell belongs to.
   */
  colDef: _propTypes.default.object.isRequired,
  /**
   * The column field of the cell that triggered the event.
   */
  field: _propTypes.default.string.isRequired,
  /**
   * A ref allowing to set imperative focus.
   * It can be passed to the element that should receive focus.
   * @ignore - do not document.
   */
  focusElementRef: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.shape({
    current: _propTypes.default.shape({
      focus: _propTypes.default.func.isRequired
    })
  })]),
  /**
   * The cell value formatted with the column valueFormatter.
   */
  formattedValue: _propTypes.default.any,
  /**
   * If true, the cell is the active element.
   */
  hasFocus: _propTypes.default.bool.isRequired,
  hideDescendantCount: _propTypes.default.bool,
  /**
   * The grid row id.
   */
  id: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]).isRequired,
  /**
   * If true, the cell is editable.
   */
  isEditable: _propTypes.default.bool,
  /**
   * The row model of the row that the current cell belongs to.
   */
  row: _propTypes.default.any.isRequired,
  /**
   * The node of the row that the current cell belongs to.
   */
  rowNode: _propTypes.default.object.isRequired,
  /**
   * the tabIndex value.
   */
  tabIndex: _propTypes.default.oneOf([-1, 0]).isRequired,
  /**
   * The cell value.
   * If the column has `valueGetter`, use `params.row` to directly access the fields.
   */
  value: _propTypes.default.any
} : void 0;
const GridBooleanCell = exports.GridBooleanCell = /*#__PURE__*/React.memo(GridBooleanCellRaw);
if (process.env.NODE_ENV !== "production") GridBooleanCell.displayName = "GridBooleanCell";
const renderBooleanCell = params => {
  if (params.field !== _constants.GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD && (0, _gridRowsUtils.isAutogeneratedRowNode)(params.rowNode)) {
    return '';
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridBooleanCell, (0, _extends2.default)({}, params));
};
exports.renderBooleanCell = renderBooleanCell;
if (process.env.NODE_ENV !== "production") renderBooleanCell.displayName = "renderBooleanCell";