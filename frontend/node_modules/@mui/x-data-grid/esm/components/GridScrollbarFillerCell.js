import * as React from 'react';
import clsx from 'clsx';
import { gridClasses } from "../constants/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
const classes = {
  root: gridClasses.scrollbarFiller,
  header: gridClasses['scrollbarFiller--header'],
  borderTop: gridClasses['scrollbarFiller--borderTop'],
  borderBottom: gridClasses['scrollbarFiller--borderBottom'],
  pinnedRight: gridClasses['scrollbarFiller--pinnedRight']
};
function GridScrollbarFillerCell({
  header,
  borderTop = true,
  borderBottom,
  pinnedRight
}) {
  return /*#__PURE__*/_jsx("div", {
    role: "presentation",
    className: clsx(classes.root, header && classes.header, borderTop && classes.borderTop, borderBottom && classes.borderBottom, pinnedRight && classes.pinnedRight)
  });
}
export { GridScrollbarFillerCell };