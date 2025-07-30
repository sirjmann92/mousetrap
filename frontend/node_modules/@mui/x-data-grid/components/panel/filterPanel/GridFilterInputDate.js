"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridFilterInputDate = GridFilterInputDate;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useTimeout = require("../../../hooks/utils/useTimeout");
var _useGridRootProps = require("../../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["item", "applyValue", "type", "apiRef", "focusElementRef", "slotProps", "isFilterActive", "headerFilterMenu", "clearButton", "tabIndex", "disabled"];
function convertFilterItemValueToInputValue(itemValue, inputType) {
  if (itemValue == null) {
    return '';
  }
  const dateCopy = new Date(itemValue);
  if (Number.isNaN(dateCopy.getTime())) {
    return '';
  }
  if (inputType === 'date') {
    return dateCopy.toISOString().substring(0, 10);
  }
  if (inputType === 'datetime-local') {
    // The date picker expects the date to be in the local timezone.
    // But .toISOString() converts it to UTC with zero offset.
    // So we need to subtract the timezone offset.
    dateCopy.setMinutes(dateCopy.getMinutes() - dateCopy.getTimezoneOffset());
    return dateCopy.toISOString().substring(0, 19);
  }
  return dateCopy.toISOString().substring(0, 10);
}
function GridFilterInputDate(props) {
  const {
      item,
      applyValue,
      type,
      apiRef,
      focusElementRef,
      slotProps,
      headerFilterMenu,
      clearButton,
      tabIndex,
      disabled
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootSlotProps = slotProps?.root.slotProps;
  const filterTimeout = (0, _useTimeout.useTimeout)();
  const [filterValueState, setFilterValueState] = React.useState(() => convertFilterItemValueToInputValue(item.value, type));
  const [applying, setIsApplying] = React.useState(false);
  const id = (0, _useId.default)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const onFilterChange = React.useCallback(event => {
    filterTimeout.clear();
    const value = event.target.value;
    setFilterValueState(value);
    setIsApplying(true);
    filterTimeout.start(rootProps.filterDebounceMs, () => {
      const date = new Date(value);
      applyValue((0, _extends2.default)({}, item, {
        value: Number.isNaN(date.getTime()) ? undefined : date
      }));
      setIsApplying(false);
    });
  }, [applyValue, item, rootProps.filterDebounceMs, filterTimeout]);
  React.useEffect(() => {
    const value = convertFilterItemValueToInputValue(item.value, type);
    setFilterValueState(value);
  }, [item.value, type]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTextField, (0, _extends2.default)({
      fullWidth: true,
      id: id,
      label: apiRef.current.getLocaleText('filterPanelInputLabel'),
      placeholder: apiRef.current.getLocaleText('filterPanelInputPlaceholder'),
      value: filterValueState,
      onChange: onFilterChange,
      type: type || 'text',
      disabled: disabled,
      inputRef: focusElementRef,
      slotProps: (0, _extends2.default)({}, rootSlotProps, {
        input: (0, _extends2.default)({
          endAdornment: applying ? /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.loadIcon, {
            fontSize: "small",
            color: "action"
          }) : null
        }, rootSlotProps?.input),
        htmlInput: (0, _extends2.default)({
          max: type === 'datetime-local' ? '9999-12-31T23:59' : '9999-12-31',
          tabIndex
        }, rootSlotProps?.htmlInput)
      })
    }, rootProps.slotProps?.baseTextField, other, slotProps?.root)), headerFilterMenu, clearButton]
  });
}
process.env.NODE_ENV !== "production" ? GridFilterInputDate.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  apiRef: _propTypes.default.shape({
    current: _propTypes.default.object.isRequired
  }).isRequired,
  applyValue: _propTypes.default.func.isRequired,
  className: _propTypes.default.string,
  clearButton: _propTypes.default.node,
  disabled: _propTypes.default.bool,
  focusElementRef: _propTypes.default /* @typescript-to-proptypes-ignore */.oneOfType([_propTypes.default.func, _propTypes.default.object]),
  headerFilterMenu: _propTypes.default.node,
  inputRef: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.shape({
    current: (props, propName) => {
      if (props[propName] == null) {
        return null;
      }
      if (typeof props[propName] !== 'object' || props[propName].nodeType !== 1) {
        return new Error(`Expected prop '${propName}' to be of type Element`);
      }
      return null;
    }
  })]),
  /**
   * It is `true` if the filter either has a value or an operator with no value
   * required is selected (for example `isEmpty`)
   */
  isFilterActive: _propTypes.default.bool,
  item: _propTypes.default.shape({
    field: _propTypes.default.string.isRequired,
    id: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
    operator: _propTypes.default.string.isRequired,
    value: _propTypes.default.any
  }).isRequired,
  onBlur: _propTypes.default.func,
  onFocus: _propTypes.default.func,
  slotProps: _propTypes.default.object,
  tabIndex: _propTypes.default.number,
  type: _propTypes.default.oneOf(['date', 'datetime-local'])
} : void 0;