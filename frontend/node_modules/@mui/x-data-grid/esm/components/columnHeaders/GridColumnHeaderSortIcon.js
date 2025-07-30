import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import PropTypes from 'prop-types';
import { GridIconButtonContainer } from "./GridIconButtonContainer.js";
import { GridColumnSortButton } from "../GridColumnSortButton.js";
import { jsx as _jsx } from "react/jsx-runtime";
function GridColumnHeaderSortIconRaw(props) {
  return /*#__PURE__*/_jsx(GridIconButtonContainer, {
    children: /*#__PURE__*/_jsx(GridColumnSortButton, _extends({}, props, {
      tabIndex: -1
    }))
  });
}
const GridColumnHeaderSortIcon = /*#__PURE__*/React.memo(GridColumnHeaderSortIconRaw);
if (process.env.NODE_ENV !== "production") GridColumnHeaderSortIcon.displayName = "GridColumnHeaderSortIcon";
process.env.NODE_ENV !== "production" ? GridColumnHeaderSortIconRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: PropTypes.string,
  color: PropTypes.oneOf(['default', 'inherit', 'primary']),
  direction: PropTypes.oneOf(['asc', 'desc']),
  disabled: PropTypes.bool,
  edge: PropTypes.oneOf(['end', 'start', false]),
  field: PropTypes.string.isRequired,
  id: PropTypes.string,
  index: PropTypes.number,
  label: PropTypes.string,
  role: PropTypes.string,
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])).isRequired,
  style: PropTypes.object,
  tabIndex: PropTypes.number,
  title: PropTypes.string,
  touchRippleRef: PropTypes.any
} : void 0;
export { GridColumnHeaderSortIcon };