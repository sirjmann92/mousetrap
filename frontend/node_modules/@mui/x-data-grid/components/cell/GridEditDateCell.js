"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridEditDateCell = GridEditDateCell;
exports.renderEditDateCell = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _styles = require("@mui/material/styles");
var _assert = require("../../utils/assert");
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["id", "value", "formattedValue", "api", "field", "row", "rowNode", "colDef", "cellMode", "isEditable", "tabIndex", "hasFocus", "inputProps", "isValidating", "isProcessingProps", "onValueChange", "slotProps"];
const StyledInputBase = (0, _styles.styled)(_assert.NotRendered)({
  fontSize: 'inherit'
});
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['editInputCell']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
function GridEditDateCell(props) {
  const {
      id,
      value: valueProp,
      field,
      colDef,
      hasFocus,
      onValueChange,
      slotProps
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const isDateTime = colDef.type === 'dateTime';
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const inputRef = React.useRef(null);
  const valueTransformed = React.useMemo(() => {
    let parsedDate;
    if (valueProp == null) {
      parsedDate = null;
    } else if (valueProp instanceof Date) {
      parsedDate = valueProp;
    } else {
      parsedDate = new Date((valueProp ?? '').toString());
    }
    let formattedDate;
    if (parsedDate == null || Number.isNaN(parsedDate.getTime())) {
      formattedDate = '';
    } else {
      const localDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60 * 1000);
      formattedDate = localDate.toISOString().substr(0, isDateTime ? 16 : 10);
    }
    return {
      parsed: parsedDate,
      formatted: formattedDate
    };
  }, [valueProp, isDateTime]);
  const [valueState, setValueState] = React.useState(valueTransformed);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = {
    classes: rootProps.classes
  };
  const classes = useUtilityClasses(ownerState);
  const parseValueToDate = React.useCallback(value => {
    if (value === '') {
      return null;
    }
    const [date, time] = value.split('T');
    const [year, month, day] = date.split('-');
    const parsedDate = new Date();
    parsedDate.setFullYear(Number(year), Number(month) - 1, Number(day));
    parsedDate.setHours(0, 0, 0, 0);
    if (time) {
      const [hours, minutes] = time.split(':');
      parsedDate.setHours(Number(hours), Number(minutes), 0, 0);
    }
    return parsedDate;
  }, []);
  const handleChange = React.useCallback(async event => {
    const newFormattedDate = event.target.value;
    const newParsedDate = parseValueToDate(newFormattedDate);
    if (onValueChange) {
      await onValueChange(event, newParsedDate);
    }
    setValueState({
      parsed: newParsedDate,
      formatted: newFormattedDate
    });
    apiRef.current.setEditCellValue({
      id,
      field,
      value: newParsedDate
    }, event);
  }, [apiRef, field, id, onValueChange, parseValueToDate]);
  React.useEffect(() => {
    setValueState(state => {
      if (valueTransformed.parsed !== state.parsed && valueTransformed.parsed?.getTime() !== state.parsed?.getTime()) {
        return valueTransformed;
      }
      return state;
    });
  }, [valueTransformed]);
  (0, _useEnhancedEffect.default)(() => {
    if (hasFocus) {
      inputRef.current.focus();
    }
  }, [hasFocus]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(StyledInputBase, (0, _extends2.default)({
    as: rootProps.slots.baseInput,
    inputRef: inputRef,
    fullWidth: true,
    className: classes.root,
    type: isDateTime ? 'datetime-local' : 'date',
    value: valueState.formatted,
    onChange: handleChange
  }, other, slotProps?.root, {
    slotProps: {
      htmlInput: (0, _extends2.default)({
        max: isDateTime ? '9999-12-31T23:59' : '9999-12-31'
      }, slotProps?.root?.slotProps?.htmlInput)
    }
  }));
}
process.env.NODE_ENV !== "production" ? GridEditDateCell.propTypes = {
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
  changeReason: _propTypes.default.oneOf(['debouncedSetEditCellValue', 'setEditCellValue']),
  /**
   * The column of the row that the current cell belongs to.
   */
  colDef: _propTypes.default.object.isRequired,
  /**
   * The column field of the cell that triggered the event.
   */
  field: _propTypes.default.string.isRequired,
  /**
   * The cell value formatted with the column valueFormatter.
   */
  formattedValue: _propTypes.default.any,
  /**
   * If true, the cell is the active element.
   */
  hasFocus: _propTypes.default.bool.isRequired,
  /**
   * The grid row id.
   */
  id: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]).isRequired,
  /**
   * If true, the cell is editable.
   */
  isEditable: _propTypes.default.bool,
  isProcessingProps: _propTypes.default.bool,
  isValidating: _propTypes.default.bool,
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {Date | null} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange: _propTypes.default.func,
  /**
   * The row model of the row that the current cell belongs to.
   */
  row: _propTypes.default.any.isRequired,
  /**
   * The node of the row that the current cell belongs to.
   */
  rowNode: _propTypes.default.object.isRequired,
  slotProps: _propTypes.default.object,
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
const renderEditDateCell = params => /*#__PURE__*/(0, _jsxRuntime.jsx)(GridEditDateCell, (0, _extends2.default)({}, params));
exports.renderEditDateCell = renderEditDateCell;
if (process.env.NODE_ENV !== "production") renderEditDateCell.displayName = "renderEditDateCell";