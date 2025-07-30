"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridFilterInputMultipleValue = GridFilterInputMultipleValue;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useGridRootProps = require("../../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
function GridFilterInputMultipleValue(props) {
  const {
    item,
    applyValue,
    type,
    apiRef,
    focusElementRef,
    slotProps
  } = props;
  const id = (0, _useId.default)();
  const [options, setOptions] = React.useState([]);
  const [filterValueState, setFilterValueState] = React.useState(item.value || []);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  React.useEffect(() => {
    const itemValue = item.value ?? [];
    setFilterValueState(itemValue.map(String));
  }, [item.value]);
  const handleChange = React.useCallback((event, value) => {
    setFilterValueState(value.map(String));
    applyValue((0, _extends2.default)({}, item, {
      value: [...value.map(filterItemValue => type === 'number' ? Number(filterItemValue) : filterItemValue)]
    }));
  }, [applyValue, item, type]);
  const handleInputChange = React.useCallback((event, value) => {
    if (value === '') {
      setOptions([]);
    } else {
      setOptions([value]);
    }
  }, [setOptions]);
  const BaseAutocomplete = rootProps.slots.baseAutocomplete;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(BaseAutocomplete, (0, _extends2.default)({
    multiple: true,
    freeSolo: true,
    options: options,
    id: id,
    value: filterValueState,
    onChange: handleChange,
    onInputChange: handleInputChange,
    label: apiRef.current.getLocaleText('filterPanelInputLabel'),
    placeholder: apiRef.current.getLocaleText('filterPanelInputPlaceholder'),
    slotProps: {
      textField: {
        type: type || 'text',
        inputRef: focusElementRef
      }
    }
  }, slotProps?.root));
}
process.env.NODE_ENV !== "production" ? GridFilterInputMultipleValue.propTypes = {
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