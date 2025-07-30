import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import composeClasses from '@mui/utils/composeClasses';
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { getDataGridUtilityClass } from "../../constants/gridClasses.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes,
    open
  } = ownerState;
  const slots = {
    root: ['menuIcon', open && 'menuOpen'],
    button: ['menuIconButton']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
export const ColumnHeaderMenuIcon = /*#__PURE__*/React.memo(props => {
  const {
    colDef,
    open,
    columnMenuId,
    columnMenuButtonId,
    iconButtonRef
  } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const ownerState = _extends({}, props, {
    classes: rootProps.classes
  });
  const classes = useUtilityClasses(ownerState);
  const handleMenuIconClick = React.useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    apiRef.current.toggleColumnMenu(colDef.field);
  }, [apiRef, colDef.field]);
  const columnName = colDef.headerName ?? colDef.field;
  return /*#__PURE__*/_jsx("div", {
    className: classes.root,
    children: /*#__PURE__*/_jsx(rootProps.slots.baseTooltip, _extends({
      title: apiRef.current.getLocaleText('columnMenuLabel'),
      enterDelay: 1000
    }, rootProps.slotProps?.baseTooltip, {
      children: /*#__PURE__*/_jsx(rootProps.slots.baseIconButton, _extends({
        ref: iconButtonRef,
        tabIndex: -1,
        className: classes.button,
        "aria-label": apiRef.current.getLocaleText('columnMenuAriaLabel')(columnName),
        size: "small",
        onClick: handleMenuIconClick,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? columnMenuId : undefined,
        id: columnMenuButtonId
      }, rootProps.slotProps?.baseIconButton, {
        children: /*#__PURE__*/_jsx(rootProps.slots.columnMenuIcon, {
          fontSize: "inherit"
        })
      }))
    }))
  });
});
if (process.env.NODE_ENV !== "production") ColumnHeaderMenuIcon.displayName = "ColumnHeaderMenuIcon";