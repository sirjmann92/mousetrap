"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridFilterForm = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _capitalize = _interopRequireDefault(require("@mui/utils/capitalize"));
var _styles = require("@mui/material/styles");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _cssVariables = require("../../../constants/cssVariables");
var _gridColumnsSelector = require("../../../hooks/features/columns/gridColumnsSelector");
var _gridFilterSelector = require("../../../hooks/features/filter/gridFilterSelector");
var _useGridSelector = require("../../../hooks/utils/useGridSelector");
var _gridFilterItem = require("../../../models/gridFilterItem");
var _useGridApiContext = require("../../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../../constants/gridClasses");
var _filterPanelUtils = require("./filterPanelUtils");
var _pivoting = require("../../../hooks/features/pivoting");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["item", "hasMultipleFilters", "deleteFilter", "applyFilterChanges", "showMultiFilterOperators", "disableMultiFilterOperator", "applyMultiFilterOperatorChanges", "focusElementRef", "logicOperators", "columnsSort", "filterColumns", "deleteIconProps", "logicOperatorInputProps", "operatorInputProps", "columnInputProps", "valueInputProps", "readOnly", "children"],
  _excluded2 = ["InputComponentProps"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['filterForm'],
    deleteIcon: ['filterFormDeleteIcon'],
    logicOperatorInput: ['filterFormLogicOperatorInput'],
    columnInput: ['filterFormColumnInput'],
    operatorInput: ['filterFormOperatorInput'],
    valueInput: ['filterFormValueInput']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridFilterFormRoot = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'FilterForm'
})({
  display: 'flex',
  gap: _cssVariables.vars.spacing(1.5)
});
const FilterFormDeleteIcon = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'FilterFormDeleteIcon'
})({
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});
const FilterFormLogicOperatorInput = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'FilterFormLogicOperatorInput'
})({
  minWidth: 75,
  justifyContent: 'end'
});
const FilterFormColumnInput = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'FilterFormColumnInput'
})({
  width: 150
});
const FilterFormOperatorInput = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'FilterFormOperatorInput'
})({
  width: 150
});
const FilterFormValueInput = (0, _styles.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'FilterFormValueInput'
})({
  width: 190
});
const getLogicOperatorLocaleKey = logicOperator => {
  switch (logicOperator) {
    case _gridFilterItem.GridLogicOperator.And:
      return 'filterPanelOperatorAnd';
    case _gridFilterItem.GridLogicOperator.Or:
      return 'filterPanelOperatorOr';
    default:
      throw new Error('MUI X: Invalid `logicOperator` property in the `GridFilterPanel`.');
  }
};
const getColumnLabel = col => col.headerName || col.field;
const collator = new Intl.Collator();
const GridFilterForm = exports.GridFilterForm = (0, _forwardRef.forwardRef)(function GridFilterForm(props, ref) {
  const {
      item,
      hasMultipleFilters,
      deleteFilter,
      applyFilterChanges,
      showMultiFilterOperators,
      disableMultiFilterOperator,
      applyMultiFilterOperatorChanges,
      focusElementRef,
      logicOperators = [_gridFilterItem.GridLogicOperator.And, _gridFilterItem.GridLogicOperator.Or],
      columnsSort,
      filterColumns,
      deleteIconProps = {},
      logicOperatorInputProps = {},
      operatorInputProps = {},
      columnInputProps = {},
      valueInputProps = {},
      readOnly
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const columnLookup = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnsSelector.gridColumnLookupSelector);
  const filterableColumns = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnsSelector.gridFilterableColumnDefinitionsSelector);
  const filterModel = (0, _useGridSelector.useGridSelector)(apiRef, _gridFilterSelector.gridFilterModelSelector);
  const columnSelectId = (0, _useId.default)();
  const columnSelectLabelId = (0, _useId.default)();
  const operatorSelectId = (0, _useId.default)();
  const operatorSelectLabelId = (0, _useId.default)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  const valueRef = React.useRef(null);
  const filterSelectorRef = React.useRef(null);
  const multiFilterOperator = filterModel.logicOperator ?? _gridFilterItem.GridLogicOperator.And;
  const hasLogicOperatorColumn = hasMultipleFilters && logicOperators.length > 0;
  const baseSelectProps = rootProps.slotProps?.baseSelect || {};
  const isBaseSelectNative = baseSelectProps.native ?? false;
  const baseSelectOptionProps = rootProps.slotProps?.baseSelectOption || {};
  const {
      InputComponentProps
    } = valueInputProps,
    valueInputPropsOther = (0, _objectWithoutPropertiesLoose2.default)(valueInputProps, _excluded2);
  const pivotActive = (0, _useGridSelector.useGridSelector)(apiRef, _pivoting.gridPivotActiveSelector);
  const initialColumns = (0, _useGridSelector.useGridSelector)(apiRef, _pivoting.gridPivotInitialColumnsSelector);
  const {
    filteredColumns,
    selectedField
  } = React.useMemo(() => {
    let itemField = item.field;

    // Yields a valid value if the current filter belongs to a column that is not filterable
    const selectedNonFilterableColumn = columnLookup[item.field].filterable === false ? columnLookup[item.field] : null;
    if (selectedNonFilterableColumn) {
      return {
        filteredColumns: [selectedNonFilterableColumn],
        selectedField: itemField
      };
    }
    if (pivotActive) {
      return {
        filteredColumns: filterableColumns.filter(column => initialColumns.get(column.field) !== undefined),
        selectedField: itemField
      };
    }
    if (filterColumns === undefined || typeof filterColumns !== 'function') {
      return {
        filteredColumns: filterableColumns,
        selectedField: itemField
      };
    }
    const filteredFields = filterColumns({
      field: item.field,
      columns: filterableColumns,
      currentFilters: filterModel?.items || []
    });
    return {
      filteredColumns: filterableColumns.filter(column => {
        const isFieldIncluded = filteredFields.includes(column.field);
        if (column.field === item.field && !isFieldIncluded) {
          itemField = undefined;
        }
        return isFieldIncluded;
      }),
      selectedField: itemField
    };
  }, [item.field, columnLookup, pivotActive, filterColumns, filterableColumns, filterModel?.items, initialColumns]);
  const sortedFilteredColumns = React.useMemo(() => {
    switch (columnsSort) {
      case 'asc':
        return filteredColumns.sort((a, b) => collator.compare(getColumnLabel(a), getColumnLabel(b)));
      case 'desc':
        return filteredColumns.sort((a, b) => -collator.compare(getColumnLabel(a), getColumnLabel(b)));
      default:
        return filteredColumns;
    }
  }, [filteredColumns, columnsSort]);
  const currentColumn = item.field ? apiRef.current.getColumn(item.field) : null;
  const currentOperator = React.useMemo(() => {
    if (!item.operator || !currentColumn) {
      return null;
    }
    return currentColumn.filterOperators?.find(operator => operator.value === item.operator);
  }, [item, currentColumn]);
  const changeColumn = React.useCallback(event => {
    const field = event.target.value;
    const column = apiRef.current.getColumn(field);
    if (column.field === currentColumn.field) {
      // column did not change
      return;
    }

    // try to keep the same operator when column change
    const newOperator = column.filterOperators.find(operator => operator.value === item.operator) || column.filterOperators[0];

    // Erase filter value if the input component or filtered column type is modified
    const eraseFilterValue = !newOperator.InputComponent || newOperator.InputComponent !== currentOperator?.InputComponent || column.type !== currentColumn.type;
    let filterValue = eraseFilterValue ? undefined : item.value;

    // Check filter value against the new valueOptions
    if (column.type === 'singleSelect' && filterValue !== undefined) {
      const colDef = column;
      const valueOptions = (0, _filterPanelUtils.getValueOptions)(colDef);
      if (Array.isArray(filterValue)) {
        filterValue = filterValue.filter(val => {
          return (
            // Only keep values that are in the new value options
            (0, _filterPanelUtils.getValueFromValueOptions)(val, valueOptions, colDef?.getOptionValue) !== undefined
          );
        });
      } else if ((0, _filterPanelUtils.getValueFromValueOptions)(item.value, valueOptions, colDef?.getOptionValue) === undefined) {
        // Reset the filter value if it is not in the new value options
        filterValue = undefined;
      }
    }
    applyFilterChanges((0, _extends2.default)({}, item, {
      field,
      operator: newOperator.value,
      value: filterValue
    }));
  }, [apiRef, applyFilterChanges, item, currentColumn, currentOperator]);
  const changeOperator = React.useCallback(event => {
    const operator = event.target.value;
    const newOperator = currentColumn?.filterOperators.find(op => op.value === operator);
    const eraseItemValue = !newOperator?.InputComponent || newOperator?.InputComponent !== currentOperator?.InputComponent;
    applyFilterChanges((0, _extends2.default)({}, item, {
      operator,
      value: eraseItemValue ? undefined : item.value
    }));
  }, [applyFilterChanges, item, currentColumn, currentOperator]);
  const changeLogicOperator = React.useCallback(event => {
    const logicOperator = event.target.value === _gridFilterItem.GridLogicOperator.And.toString() ? _gridFilterItem.GridLogicOperator.And : _gridFilterItem.GridLogicOperator.Or;
    applyMultiFilterOperatorChanges(logicOperator);
  }, [applyMultiFilterOperatorChanges]);
  const handleDeleteFilter = () => {
    deleteFilter(item);
  };
  React.useImperativeHandle(focusElementRef, () => ({
    focus: () => {
      if (currentOperator?.InputComponent) {
        valueRef?.current?.focus();
      } else {
        filterSelectorRef.current.focus();
      }
    }
  }), [currentOperator]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(GridFilterFormRoot, (0, _extends2.default)({
    className: classes.root,
    "data-id": item.id,
    ownerState: rootProps
  }, other, {
    ref: ref,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(FilterFormDeleteIcon, (0, _extends2.default)({}, deleteIconProps, {
      className: (0, _clsx.default)(classes.deleteIcon, deleteIconProps.className),
      ownerState: rootProps,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseIconButton, (0, _extends2.default)({
        "aria-label": apiRef.current.getLocaleText('filterPanelDeleteIconLabel'),
        title: apiRef.current.getLocaleText('filterPanelDeleteIconLabel'),
        onClick: handleDeleteFilter,
        size: "small",
        disabled: readOnly
      }, rootProps.slotProps?.baseIconButton, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.filterPanelDeleteIcon, {
          fontSize: "small"
        })
      }))
    })), /*#__PURE__*/(0, _jsxRuntime.jsx)(FilterFormLogicOperatorInput, (0, _extends2.default)({
      as: rootProps.slots.baseSelect,
      sx: [hasLogicOperatorColumn ? {
        display: 'flex'
      } : {
        display: 'none'
      }, showMultiFilterOperators ? {
        visibility: 'visible'
      } : {
        visibility: 'hidden'
      }, logicOperatorInputProps.sx],
      className: (0, _clsx.default)(classes.logicOperatorInput, logicOperatorInputProps.className),
      ownerState: rootProps
    }, logicOperatorInputProps, {
      size: "small",
      slotProps: {
        htmlInput: {
          'aria-label': apiRef.current.getLocaleText('filterPanelLogicOperator')
        }
      },
      value: multiFilterOperator ?? '',
      onChange: changeLogicOperator,
      disabled: !!disableMultiFilterOperator || logicOperators.length === 1,
      native: isBaseSelectNative
    }, rootProps.slotProps?.baseSelect, {
      children: logicOperators.map(logicOperator => /*#__PURE__*/(0, _react.createElement)(rootProps.slots.baseSelectOption, (0, _extends2.default)({}, baseSelectOptionProps, {
        native: isBaseSelectNative,
        key: logicOperator.toString(),
        value: logicOperator.toString()
      }), apiRef.current.getLocaleText(getLogicOperatorLocaleKey(logicOperator))))
    })), /*#__PURE__*/(0, _jsxRuntime.jsx)(FilterFormColumnInput, (0, _extends2.default)({
      as: rootProps.slots.baseSelect
    }, columnInputProps, {
      className: (0, _clsx.default)(classes.columnInput, columnInputProps.className),
      ownerState: rootProps,
      size: "small",
      labelId: columnSelectLabelId,
      id: columnSelectId,
      label: apiRef.current.getLocaleText('filterPanelColumns'),
      value: selectedField ?? '',
      onChange: changeColumn,
      native: isBaseSelectNative,
      disabled: readOnly
    }, rootProps.slotProps?.baseSelect, {
      children: sortedFilteredColumns.map(col => /*#__PURE__*/(0, _react.createElement)(rootProps.slots.baseSelectOption, (0, _extends2.default)({}, baseSelectOptionProps, {
        native: isBaseSelectNative,
        key: col.field,
        value: col.field
      }), getColumnLabel(col)))
    })), /*#__PURE__*/(0, _jsxRuntime.jsx)(FilterFormOperatorInput, (0, _extends2.default)({
      as: rootProps.slots.baseSelect,
      size: "small"
    }, operatorInputProps, {
      className: (0, _clsx.default)(classes.operatorInput, operatorInputProps.className),
      ownerState: rootProps,
      labelId: operatorSelectLabelId,
      label: apiRef.current.getLocaleText('filterPanelOperator'),
      id: operatorSelectId,
      value: item.operator,
      onChange: changeOperator,
      native: isBaseSelectNative,
      inputRef: filterSelectorRef,
      disabled: readOnly
    }, rootProps.slotProps?.baseSelect, {
      children: currentColumn?.filterOperators?.map(operator => /*#__PURE__*/(0, _react.createElement)(rootProps.slots.baseSelectOption, (0, _extends2.default)({}, baseSelectOptionProps, {
        native: isBaseSelectNative,
        key: operator.value,
        value: operator.value
      }), operator.label || apiRef.current.getLocaleText(`filterOperator${(0, _capitalize.default)(operator.value)}`)))
    })), /*#__PURE__*/(0, _jsxRuntime.jsx)(FilterFormValueInput, (0, _extends2.default)({}, valueInputPropsOther, {
      className: (0, _clsx.default)(classes.valueInput, valueInputPropsOther.className),
      ownerState: rootProps,
      children: currentOperator?.InputComponent ? /*#__PURE__*/(0, _jsxRuntime.jsx)(currentOperator.InputComponent, (0, _extends2.default)({
        apiRef: apiRef,
        item: item,
        applyValue: applyFilterChanges,
        focusElementRef: valueRef,
        disabled: readOnly,
        slotProps: {
          root: {
            size: 'small'
          }
        }
      }, currentOperator.InputComponentProps, InputComponentProps), item.field) : null
    }))]
  }));
});
if (process.env.NODE_ENV !== "production") GridFilterForm.displayName = "GridFilterForm";
process.env.NODE_ENV !== "production" ? GridFilterForm.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Callback called when the operator, column field or value is changed.
   * @param {GridFilterItem} item The updated [[GridFilterItem]].
   */
  applyFilterChanges: _propTypes.default.func.isRequired,
  /**
   * Callback called when the logic operator is changed.
   * @param {GridLogicOperator} operator The new logic operator.
   */
  applyMultiFilterOperatorChanges: _propTypes.default.func.isRequired,
  /**
   * @ignore - do not document.
   */
  children: _propTypes.default.node,
  /**
   * Props passed to the column input component.
   * @default {}
   */
  columnInputProps: _propTypes.default.any,
  /**
   * Changes how the options in the columns selector should be ordered.
   * If not specified, the order is derived from the `columns` prop.
   */
  columnsSort: _propTypes.default.oneOf(['asc', 'desc']),
  /**
   * Callback called when the delete button is clicked.
   * @param {GridFilterItem} item The deleted [[GridFilterItem]].
   */
  deleteFilter: _propTypes.default.func.isRequired,
  /**
   * Props passed to the delete icon.
   * @default {}
   */
  deleteIconProps: _propTypes.default.any,
  /**
   * If `true`, disables the logic operator field but still renders it.
   */
  disableMultiFilterOperator: _propTypes.default.bool,
  /**
   * Allows to filter the columns displayed in the filter form.
   * @param {FilterColumnsArgs} args The columns of the grid and name of field.
   * @returns {GridColDef['field'][]} The filtered fields array.
   */
  filterColumns: _propTypes.default.func,
  /**
   * A ref allowing to set imperative focus.
   * It can be passed to the el
   */
  focusElementRef: _propTypes.default /* @typescript-to-proptypes-ignore */.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  /**
   * If `true`, the logic operator field is rendered.
   * The field will be invisible if `showMultiFilterOperators` is also `true`.
   */
  hasMultipleFilters: _propTypes.default.bool.isRequired,
  /**
   * The [[GridFilterItem]] representing this form.
   */
  item: _propTypes.default.shape({
    field: _propTypes.default.string.isRequired,
    id: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
    operator: _propTypes.default.string.isRequired,
    value: _propTypes.default.any
  }).isRequired,
  /**
   * Props passed to the logic operator input component.
   * @default {}
   */
  logicOperatorInputProps: _propTypes.default.any,
  /**
   * Sets the available logic operators.
   * @default [GridLogicOperator.And, GridLogicOperator.Or]
   */
  logicOperators: _propTypes.default.arrayOf(_propTypes.default.oneOf(['and', 'or']).isRequired),
  /**
   * Props passed to the operator input component.
   * @default {}
   */
  operatorInputProps: _propTypes.default.any,
  /**
   * `true` if the filter is disabled/read only.
   * i.e. `colDef.fiterable = false` but passed in `filterModel`
   * @default false
   */
  readOnly: _propTypes.default.bool,
  /**
   * If `true`, the logic operator field is visible.
   */
  showMultiFilterOperators: _propTypes.default.bool,
  /**
   * Props passed to the value input component.
   * @default {}
   */
  valueInputProps: _propTypes.default.any
} : void 0;

/**
 * Demos:
 * - [Filtering - overview](https://mui.com/x/react-data-grid/filtering/)
 *
 * API:
 * - [GridFilterForm API](https://mui.com/x/api/data-grid/grid-filter-form/)
 */