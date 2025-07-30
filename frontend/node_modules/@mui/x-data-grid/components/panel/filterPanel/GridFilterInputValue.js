"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridFilterInputValue = GridFilterInputValue;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useTimeout = require("../../../hooks/utils/useTimeout");
var _useGridRootProps = require("../../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["item", "applyValue", "type", "apiRef", "focusElementRef", "tabIndex", "disabled", "isFilterActive", "slotProps", "clearButton", "headerFilterMenu"];
function GridFilterInputValue(props) {
  const {
      item,
      applyValue,
      type,
      apiRef,
      focusElementRef,
      tabIndex,
      disabled,
      slotProps,
      clearButton,
      headerFilterMenu
    } = props,
    others = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const textFieldProps = slotProps?.root;
  const filterTimeout = (0, _useTimeout.useTimeout)();
  const [filterValueState, setFilterValueState] = React.useState(sanitizeFilterItemValue(item.value));
  const [applying, setIsApplying] = React.useState(false);
  const id = (0, _useId.default)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const onFilterChange = React.useCallback(event => {
    const value = sanitizeFilterItemValue(event.target.value);
    setFilterValueState(value);
    setIsApplying(true);
    filterTimeout.start(rootProps.filterDebounceMs, () => {
      const newItem = (0, _extends2.default)({}, item, {
        value: type === 'number' && !Number.isNaN(Number(value)) ? Number(value) : value,
        fromInput: id
      });
      applyValue(newItem);
      setIsApplying(false);
    });
  }, [filterTimeout, rootProps.filterDebounceMs, item, type, id, applyValue]);
  React.useEffect(() => {
    const itemPlusTag = item;
    if (itemPlusTag.fromInput !== id || item.value == null) {
      setFilterValueState(sanitizeFilterItemValue(item.value));
    }
  }, [id, item]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTextField, (0, _extends2.default)({
      id: id,
      label: apiRef.current.getLocaleText('filterPanelInputLabel'),
      placeholder: apiRef.current.getLocaleText('filterPanelInputPlaceholder'),
      value: filterValueState ?? '',
      onChange: onFilterChange,
      type: type || 'text',
      disabled: disabled,
      slotProps: (0, _extends2.default)({}, textFieldProps?.slotProps, {
        input: (0, _extends2.default)({
          endAdornment: applying ? /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.loadIcon, {
            fontSize: "small",
            color: "action"
          }) : null
        }, textFieldProps?.slotProps?.input),
        htmlInput: (0, _extends2.default)({
          tabIndex
        }, textFieldProps?.slotProps?.htmlInput)
      }),
      inputRef: focusElementRef
    }, rootProps.slotProps?.baseTextField, others, textFieldProps)), headerFilterMenu, clearButton]
  });
}
function sanitizeFilterItemValue(value) {
  if (value == null || value === '') {
    return undefined;
  }
  return String(value);
}
process.env.NODE_ENV !== "production" ? GridFilterInputValue.propTypes = {
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
  type: _propTypes.default.oneOf(['date', 'datetime-local', 'number', 'text'])
} : void 0;