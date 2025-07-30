import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["label", "icon", "showInMenu", "onClick"],
  _excluded2 = ["label", "icon", "showInMenu", "onClick", "closeMenuOnClick", "closeMenu"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const GridActionsCellItem = forwardRef((props, ref) => {
  const rootProps = useGridRootProps();
  if (!props.showInMenu) {
    const {
        label,
        icon,
        onClick
      } = props,
      other = _objectWithoutPropertiesLoose(props, _excluded);
    const handleClick = event => {
      onClick?.(event);
    };
    return /*#__PURE__*/_jsx(rootProps.slots.baseIconButton, _extends({
      size: "small",
      role: "menuitem",
      "aria-label": label
    }, other, {
      onClick: handleClick
    }, rootProps.slotProps?.baseIconButton, {
      ref: ref,
      children: /*#__PURE__*/React.cloneElement(icon, {
        fontSize: 'small'
      })
    }));
  }
  const {
      label,
      icon,
      onClick,
      closeMenuOnClick = true,
      closeMenu
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded2);
  const handleClick = event => {
    onClick?.(event);
    if (closeMenuOnClick) {
      closeMenu?.();
    }
  };
  return /*#__PURE__*/_jsx(rootProps.slots.baseMenuItem, _extends({
    ref: ref
  }, other, {
    onClick: handleClick,
    iconStart: icon,
    children: label
  }));
});
if (process.env.NODE_ENV !== "production") GridActionsCellItem.displayName = "GridActionsCellItem";
process.env.NODE_ENV !== "production" ? GridActionsCellItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: PropTypes.string,
  /**
   * from https://mui.com/material-ui/api/button-base/#ButtonBase-prop-component
   */
  component: PropTypes.elementType,
  disabled: PropTypes.bool,
  icon: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([PropTypes.element, PropTypes.func, PropTypes.number, PropTypes.object, PropTypes.string, PropTypes.bool]),
  label: PropTypes.node,
  showInMenu: PropTypes.bool,
  style: PropTypes.object
} : void 0;
export { GridActionsCellItem };