import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import PropTypes from 'prop-types';
import { GridColumnMenuHideItem } from "./GridColumnMenuHideItem.js";
import { GridColumnMenuManageItem } from "./GridColumnMenuManageItem.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function GridColumnMenuColumnsItem(props) {
  return /*#__PURE__*/_jsxs(React.Fragment, {
    children: [/*#__PURE__*/_jsx(GridColumnMenuHideItem, _extends({}, props)), /*#__PURE__*/_jsx(GridColumnMenuManageItem, _extends({}, props))]
  });
}
process.env.NODE_ENV !== "production" ? GridColumnMenuColumnsItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
} : void 0;
export { GridColumnMenuColumnsItem };