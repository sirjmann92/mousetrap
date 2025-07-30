import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import clsx from 'clsx';
import { styled } from '@mui/system';
import composeClasses from '@mui/utils/composeClasses';
import { gridClasses, getDataGridUtilityClass } from "../../constants/gridClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = () => {
  const slots = {
    root: ['topContainer']
  };
  return composeClasses(slots, getDataGridUtilityClass, {});
};
const Element = styled('div')({
  position: 'sticky',
  zIndex: 40,
  top: 0
});
export function GridTopContainer(props) {
  const classes = useUtilityClasses();
  return /*#__PURE__*/_jsx(Element, _extends({}, props, {
    className: clsx(classes.root, gridClasses['container--top']),
    role: "presentation"
  }));
}