"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridFilterInputBoolean = GridFilterInputBoolean;
exports.sanitizeFilterItemValue = sanitizeFilterItemValue;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _refType = _interopRequireDefault(require("@mui/utils/refType"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useGridRootProps = require("../../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["item", "applyValue", "apiRef", "focusElementRef", "isFilterActive", "headerFilterMenu", "clearButton", "tabIndex", "slotProps"];
function GridFilterInputBoolean(props) {
  const {
      item,
      applyValue,
      apiRef,
      focusElementRef,
      headerFilterMenu,
      clearButton,
      tabIndex,
      slotProps
    } = props,
    others = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const [filterValueState, setFilterValueState] = React.useState(sanitizeFilterItemValue(item.value));
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const labelId = (0, _useId.default)();
  const selectId = (0, _useId.default)();
  const baseSelectProps = rootProps.slotProps?.baseSelect || {};
  const isSelectNative = baseSelectProps.native ?? false;
  const baseSelectOptionProps = rootProps.slotProps?.baseSelectOption || {};
  const onFilterChange = React.useCallback(event => {
    const value = sanitizeFilterItemValue(event.target.value);
    setFilterValueState(value);
    applyValue((0, _extends2.default)({}, item, {
      value
    }));
  }, [applyValue, item]);
  React.useEffect(() => {
    setFilterValueState(sanitizeFilterItemValue(item.value));
  }, [item.value]);
  const label = slotProps?.root.label ?? apiRef.current.getLocaleText('filterPanelInputLabel');
  const rootSlotProps = slotProps?.root.slotProps;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(rootProps.slots.baseSelect, (0, _extends2.default)({
      fullWidth: true,
      labelId: labelId,
      id: selectId,
      label: label,
      value: filterValueState === undefined ? '' : String(filterValueState),
      onChange: onFilterChange,
      native: isSelectNative,
      slotProps: {
        htmlInput: (0, _extends2.default)({
          ref: focusElementRef,
          tabIndex
        }, rootSlotProps?.htmlInput)
      }
    }, baseSelectProps, others, slotProps?.root, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseSelectOption, (0, _extends2.default)({}, baseSelectOptionProps, {
        native: isSelectNative,
        value: "",
        children: apiRef.current.getLocaleText('filterValueAny')
      })), /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseSelectOption, (0, _extends2.default)({}, baseSelectOptionProps, {
        native: isSelectNative,
        value: "true",
        children: apiRef.current.getLocaleText('filterValueTrue')
      })), /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseSelectOption, (0, _extends2.default)({}, baseSelectOptionProps, {
        native: isSelectNative,
        value: "false",
        children: apiRef.current.getLocaleText('filterValueFalse')
      }))]
    })), headerFilterMenu, clearButton]
  });
}
function sanitizeFilterItemValue(value) {
  if (String(value).toLowerCase() === 'true') {
    return true;
  }
  if (String(value).toLowerCase() === 'false') {
    return false;
  }
  return undefined;
}
process.env.NODE_ENV !== "production" ? GridFilterInputBoolean.propTypes = {
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
  focusElementRef: _refType.default,
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
  tabIndex: _propTypes.default.number
} : void 0;