'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["item", "applyValue", "apiRef", "focusElementRef", "isFilterActive", "headerFilterMenu", "clearButton", "tabIndex", "slotProps"];
import * as React from 'react';
import PropTypes from 'prop-types';
import refType from '@mui/utils/refType';
import useId from '@mui/utils/useId';
import { useGridRootProps } from "../../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    others = _objectWithoutPropertiesLoose(props, _excluded);
  const [filterValueState, setFilterValueState] = React.useState(sanitizeFilterItemValue(item.value));
  const rootProps = useGridRootProps();
  const labelId = useId();
  const selectId = useId();
  const baseSelectProps = rootProps.slotProps?.baseSelect || {};
  const isSelectNative = baseSelectProps.native ?? false;
  const baseSelectOptionProps = rootProps.slotProps?.baseSelectOption || {};
  const onFilterChange = React.useCallback(event => {
    const value = sanitizeFilterItemValue(event.target.value);
    setFilterValueState(value);
    applyValue(_extends({}, item, {
      value
    }));
  }, [applyValue, item]);
  React.useEffect(() => {
    setFilterValueState(sanitizeFilterItemValue(item.value));
  }, [item.value]);
  const label = slotProps?.root.label ?? apiRef.current.getLocaleText('filterPanelInputLabel');
  const rootSlotProps = slotProps?.root.slotProps;
  return /*#__PURE__*/_jsxs(React.Fragment, {
    children: [/*#__PURE__*/_jsxs(rootProps.slots.baseSelect, _extends({
      fullWidth: true,
      labelId: labelId,
      id: selectId,
      label: label,
      value: filterValueState === undefined ? '' : String(filterValueState),
      onChange: onFilterChange,
      native: isSelectNative,
      slotProps: {
        htmlInput: _extends({
          ref: focusElementRef,
          tabIndex
        }, rootSlotProps?.htmlInput)
      }
    }, baseSelectProps, others, slotProps?.root, {
      children: [/*#__PURE__*/_jsx(rootProps.slots.baseSelectOption, _extends({}, baseSelectOptionProps, {
        native: isSelectNative,
        value: "",
        children: apiRef.current.getLocaleText('filterValueAny')
      })), /*#__PURE__*/_jsx(rootProps.slots.baseSelectOption, _extends({}, baseSelectOptionProps, {
        native: isSelectNative,
        value: "true",
        children: apiRef.current.getLocaleText('filterValueTrue')
      })), /*#__PURE__*/_jsx(rootProps.slots.baseSelectOption, _extends({}, baseSelectOptionProps, {
        native: isSelectNative,
        value: "false",
        children: apiRef.current.getLocaleText('filterValueFalse')
      }))]
    })), headerFilterMenu, clearButton]
  });
}
export function sanitizeFilterItemValue(value) {
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
  apiRef: PropTypes.shape({
    current: PropTypes.object.isRequired
  }).isRequired,
  applyValue: PropTypes.func.isRequired,
  className: PropTypes.string,
  clearButton: PropTypes.node,
  disabled: PropTypes.bool,
  focusElementRef: refType,
  headerFilterMenu: PropTypes.node,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({
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
  isFilterActive: PropTypes.bool,
  item: PropTypes.shape({
    field: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    operator: PropTypes.string.isRequired,
    value: PropTypes.any
  }).isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  slotProps: PropTypes.object,
  tabIndex: PropTypes.number
} : void 0;
export { GridFilterInputBoolean };