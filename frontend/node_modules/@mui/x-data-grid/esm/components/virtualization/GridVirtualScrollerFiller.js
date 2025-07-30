import * as React from 'react';
import { styled } from '@mui/system';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { vars } from "../../constants/cssVariables.js";
import { useGridSelector } from "../../hooks/utils/useGridSelector.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { gridDimensionsSelector } from "../../hooks/features/dimensions/index.js";
import { gridClasses } from "../../constants/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Filler = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  width: 'var(--DataGrid-rowWidth)',
  boxSizing: 'border-box'
});
const Pinned = styled('div')({
  position: 'sticky',
  height: '100%',
  boxSizing: 'border-box',
  borderTop: '1px solid var(--rowBorderColor)',
  backgroundColor: vars.cell.background.pinned
});
const PinnedLeft = styled(Pinned)({
  left: 0,
  borderRight: '1px solid var(--rowBorderColor)'
});
const PinnedRight = styled(Pinned)({
  right: 0,
  borderLeft: '1px solid var(--rowBorderColor)'
});
const Main = styled('div')({
  flexGrow: 1,
  borderTop: '1px solid var(--rowBorderColor)'
});
function GridVirtualScrollerFiller({
  rowsLength
}) {
  const apiRef = useGridApiContext();
  const {
    viewportOuterSize,
    minimumSize,
    hasScrollX,
    hasScrollY,
    scrollbarSize,
    leftPinnedWidth,
    rightPinnedWidth
  } = useGridSelector(apiRef, gridDimensionsSelector);
  const height = hasScrollX ? scrollbarSize : 0;
  const needsLastRowBorder = viewportOuterSize.height - minimumSize.height > 0;
  if (height === 0 && !needsLastRowBorder) {
    return null;
  }
  return /*#__PURE__*/_jsxs(Filler, {
    className: gridClasses.filler,
    role: "presentation",
    style: {
      height,
      '--rowBorderColor': rowsLength === 0 ? 'transparent' : 'var(--DataGrid-rowBorderColor)'
    },
    children: [leftPinnedWidth > 0 && /*#__PURE__*/_jsx(PinnedLeft, {
      className: gridClasses['filler--pinnedLeft'],
      style: {
        width: leftPinnedWidth
      }
    }), /*#__PURE__*/_jsx(Main, {}), rightPinnedWidth > 0 && /*#__PURE__*/_jsx(PinnedRight, {
      className: gridClasses['filler--pinnedRight'],
      style: {
        width: rightPinnedWidth + (hasScrollY ? scrollbarSize : 0)
      }
    })]
  });
}
const Memoized = fastMemo(GridVirtualScrollerFiller);
export { Memoized as GridVirtualScrollerFiller };