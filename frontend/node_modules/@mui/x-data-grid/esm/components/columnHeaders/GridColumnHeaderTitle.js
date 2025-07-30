'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className", "aria-label"];
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '@mui/system';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { isOverflown } from "../../utils/domUtils.js";
import { getDataGridUtilityClass } from "../../constants/gridClasses.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['columnHeaderTitle']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridColumnHeaderTitleRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'ColumnHeaderTitle'
})({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontWeight: 'var(--unstable_DataGrid-headWeight)',
  lineHeight: 'normal'
});
const ColumnHeaderInnerTitle = forwardRef(function ColumnHeaderInnerTitle(props, ref) {
  // Tooltip adds aria-label to the props, which is not needed since the children prop is a string
  // See https://github.com/mui/mui-x/pull/14482
  const {
      className
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/_jsx(GridColumnHeaderTitleRoot, _extends({
    className: clsx(classes.root, className),
    ownerState: rootProps
  }, other, {
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") ColumnHeaderInnerTitle.displayName = "ColumnHeaderInnerTitle";
// No React.memo here as if we display the sort icon, we need to recalculate the isOver
function GridColumnHeaderTitle(props) {
  const {
    label,
    description
  } = props;
  const rootProps = useGridRootProps();
  const titleRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState('');
  const handleMouseOver = React.useCallback(() => {
    if (!description && titleRef?.current) {
      const isOver = isOverflown(titleRef.current);
      if (isOver) {
        setTooltip(label);
      } else {
        setTooltip('');
      }
    }
  }, [description, label]);
  return /*#__PURE__*/_jsx(rootProps.slots.baseTooltip, _extends({
    title: description || tooltip
  }, rootProps.slotProps?.baseTooltip, {
    children: /*#__PURE__*/_jsx(ColumnHeaderInnerTitle, {
      onMouseOver: handleMouseOver,
      ref: titleRef,
      children: label
    })
  }));
}
process.env.NODE_ENV !== "production" ? GridColumnHeaderTitle.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  columnWidth: PropTypes.number.isRequired,
  description: PropTypes.node,
  label: PropTypes.string.isRequired
} : void 0;
export { GridColumnHeaderTitle };