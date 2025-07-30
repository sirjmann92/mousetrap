import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["hideMenu", "colDef", "id", "labelledby", "className", "children", "open"];
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { isHideMenuKey } from "../../../utils/keyboardUtils.js";
import { NotRendered } from "../../../utils/assert.js";
import { gridClasses } from "../../../constants/gridClasses.js";
import { useGridRootProps } from "../../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const StyledMenuList = styled(NotRendered)(() => ({
  minWidth: 248
}));
function handleMenuScrollCapture(event) {
  if (!event.currentTarget.contains(event.target)) {
    return;
  }
  event.stopPropagation();
}
const GridColumnMenuContainer = forwardRef(function GridColumnMenuContainer(props, ref) {
  const {
      hideMenu,
      id,
      labelledby,
      className,
      children,
      open
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const handleListKeyDown = React.useCallback(event => {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
    if (isHideMenuKey(event.key)) {
      hideMenu(event);
    }
  }, [hideMenu]);
  return /*#__PURE__*/_jsx(StyledMenuList, _extends({
    as: rootProps.slots.baseMenuList,
    id: id,
    className: clsx(gridClasses.menuList, className),
    "aria-labelledby": labelledby,
    onKeyDown: handleListKeyDown,
    onWheel: handleMenuScrollCapture,
    onTouchMove: handleMenuScrollCapture,
    autoFocus: open
  }, other, {
    ref: ref,
    children: children
  }));
});
if (process.env.NODE_ENV !== "production") GridColumnMenuContainer.displayName = "GridColumnMenuContainer";
process.env.NODE_ENV !== "production" ? GridColumnMenuContainer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: PropTypes.object.isRequired,
  hideMenu: PropTypes.func.isRequired,
  id: PropTypes.string,
  labelledby: PropTypes.string,
  open: PropTypes.bool.isRequired
} : void 0;
export { GridColumnMenuContainer };