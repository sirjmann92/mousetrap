'use client';

/* eslint-disable @typescript-eslint/no-use-before-define */
import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '@mui/system';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridRootProps } from "../hooks/utils/useGridRootProps.js";
import { getDataGridUtilityClass, gridClasses } from "../constants/index.js";
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { useGridEvent } from "../hooks/utils/useGridEvent.js";
import { useGridSelector } from "../hooks/utils/useGridSelector.js";
import { gridDimensionsSelector, gridColumnsTotalWidthSelector } from "../hooks/features/dimensions/gridDimensionsSelectors.js";
import { gridDensityFactorSelector } from "../hooks/features/density/densitySelector.js";
import { useTimeout } from "../hooks/utils/useTimeout.js";
import { getTotalHeaderHeight } from "../hooks/features/columns/gridColumnsUtils.js";
import { createSelector } from "../utils/createSelector.js";
import { gridRowsMetaSelector } from "../hooks/features/rows/gridRowsMetaSelector.js";
import { jsx as _jsx } from "react/jsx-runtime";
const CLIFF = 1;
const SLOP = 1.5;
const useUtilityClasses = ownerState => {
  const {
    scrollDirection,
    classes
  } = ownerState;
  const slots = {
    root: ['scrollArea', `scrollArea--${scrollDirection}`]
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridScrollAreaRawRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'ScrollArea',
  overridesResolver: (props, styles) => [{
    [`&.${gridClasses['scrollArea--left']}`]: styles['scrollArea--left']
  }, {
    [`&.${gridClasses['scrollArea--right']}`]: styles['scrollArea--right']
  }, {
    [`&.${gridClasses['scrollArea--up']}`]: styles['scrollArea--up']
  }, {
    [`&.${gridClasses['scrollArea--down']}`]: styles['scrollArea--down']
  }, styles.scrollArea]
})(() => ({
  position: 'absolute',
  zIndex: 101,
  // Horizontal scroll areas
  [`&.${gridClasses['scrollArea--left']}`]: {
    top: 0,
    left: 0,
    width: 20,
    bottom: 0
  },
  [`&.${gridClasses['scrollArea--right']}`]: {
    top: 0,
    right: 0,
    width: 20,
    bottom: 0
  },
  // Vertical scroll areas
  [`&.${gridClasses['scrollArea--up']}`]: {
    top: 0,
    left: 0,
    right: 0,
    height: 20
  },
  [`&.${gridClasses['scrollArea--down']}`]: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 20
  }
}));
const offsetSelector = createSelector(gridDimensionsSelector, (dimensions, direction) => {
  if (direction === 'left') {
    return dimensions.leftPinnedWidth;
  }
  if (direction === 'right') {
    return dimensions.rightPinnedWidth + (dimensions.hasScrollX ? dimensions.scrollbarSize : 0);
  }
  // For vertical scroll areas, we don't need horizontal offset
  return 0;
});
function GridScrollAreaWrapper(props) {
  const apiRef = useGridApiContext();
  const [dragDirection, setDragDirection] = React.useState('none');

  // Listen for both column and row drag events
  useGridEvent(apiRef, 'columnHeaderDragStart', () => setDragDirection('horizontal'));
  useGridEvent(apiRef, 'columnHeaderDragEnd', () => setDragDirection('none'));
  useGridEvent(apiRef, 'rowDragStart', () => setDragDirection('vertical'));
  useGridEvent(apiRef, 'rowDragEnd', () => setDragDirection('none'));
  if (dragDirection === 'none') {
    return null;
  }
  if (dragDirection === 'horizontal') {
    return /*#__PURE__*/_jsx(GridHorizontalScrollAreaContent, _extends({}, props));
  }
  return /*#__PURE__*/_jsx(GridVerticalScrollAreaContent, _extends({}, props));
}
function GridHorizontalScrollAreaContent(props) {
  const {
    scrollDirection,
    scrollPosition
  } = props;
  const rootRef = React.useRef(null);
  const apiRef = useGridApiContext();
  const timeout = useTimeout();
  const densityFactor = useGridSelector(apiRef, gridDensityFactorSelector);
  const columnsTotalWidth = useGridSelector(apiRef, gridColumnsTotalWidthSelector);
  const sideOffset = useGridSelector(apiRef, offsetSelector, scrollDirection);
  const getCanScrollMore = () => {
    const dimensions = gridDimensionsSelector(apiRef);
    if (scrollDirection === 'left') {
      // Only render if the user has not reached yet the start of the list
      return scrollPosition.current.left > 0;
    }
    if (scrollDirection === 'right') {
      // Only render if the user has not reached yet the end of the list
      const maxScrollLeft = columnsTotalWidth - dimensions.viewportInnerSize.width;
      return scrollPosition.current.left < maxScrollLeft;
    }
    return false;
  };
  const rootProps = useGridRootProps();
  const totalHeaderHeight = getTotalHeaderHeight(apiRef, rootProps);
  const headerHeight = Math.floor(rootProps.columnHeaderHeight * densityFactor);
  const style = _extends({
    height: headerHeight,
    top: totalHeaderHeight - headerHeight
  }, scrollDirection === 'left' ? {
    left: sideOffset
  } : {}, scrollDirection === 'right' ? {
    right: sideOffset
  } : {});
  const handleDragOver = useEventCallback(event => {
    let offset;

    // Prevents showing the forbidden cursor
    event.preventDefault();
    if (scrollDirection === 'left') {
      offset = event.clientX - rootRef.current.getBoundingClientRect().right;
    } else if (scrollDirection === 'right') {
      offset = Math.max(1, event.clientX - rootRef.current.getBoundingClientRect().left);
    } else {
      throw new Error('MUI X: Wrong drag direction');
    }
    offset = (offset - CLIFF) * SLOP + CLIFF;

    // Avoid freeze and inertia.
    timeout.start(0, () => {
      apiRef.current.scroll({
        left: scrollPosition.current.left + offset,
        top: scrollPosition.current.top
      });
    });
  });
  return /*#__PURE__*/_jsx(GridScrollAreaContent, _extends({}, props, {
    ref: rootRef,
    getCanScrollMore: getCanScrollMore,
    style: style,
    handleDragOver: handleDragOver
  }));
}
function GridVerticalScrollAreaContent(props) {
  const {
    scrollDirection,
    scrollPosition
  } = props;
  const rootRef = React.useRef(null);
  const apiRef = useGridApiContext();
  const timeout = useTimeout();
  const rowsMeta = useGridSelector(apiRef, gridRowsMetaSelector);
  const getCanScrollMore = () => {
    const dimensions = gridDimensionsSelector(apiRef);
    if (scrollDirection === 'up') {
      // Only render if the user has not reached yet the top of the list
      return scrollPosition.current.top > 0;
    }
    if (scrollDirection === 'down') {
      // Only render if the user has not reached yet the bottom of the list
      const totalRowsHeight = rowsMeta.currentPageTotalHeight || 0;
      const maxScrollTop = totalRowsHeight - dimensions.viewportInnerSize.height - (dimensions.hasScrollX ? dimensions.scrollbarSize : 0);
      return scrollPosition.current.top < maxScrollTop;
    }
    return false;
  };
  const rootProps = useGridRootProps();
  const totalHeaderHeight = getTotalHeaderHeight(apiRef, rootProps);
  const style = {
    top: scrollDirection === 'up' ? totalHeaderHeight : undefined,
    bottom: scrollDirection === 'down' ? 0 : undefined
  };
  const handleDragOver = useEventCallback(event => {
    let offset;

    // Prevents showing the forbidden cursor
    event.preventDefault();
    if (scrollDirection === 'up') {
      offset = event.clientY - rootRef.current.getBoundingClientRect().bottom;
    } else if (scrollDirection === 'down') {
      offset = Math.max(1, event.clientY - rootRef.current.getBoundingClientRect().top);
    } else {
      throw new Error('MUI X: Wrong drag direction');
    }
    offset = (offset - CLIFF) * SLOP + CLIFF;

    // Avoid freeze and inertia.
    timeout.start(0, () => {
      apiRef.current.scroll({
        left: scrollPosition.current.left,
        top: scrollPosition.current.top + offset
      });
    });
  });
  return /*#__PURE__*/_jsx(GridScrollAreaContent, _extends({}, props, {
    ref: rootRef,
    getCanScrollMore: getCanScrollMore,
    style: style,
    handleDragOver: handleDragOver
  }));
}
const GridScrollAreaContent = forwardRef(function GridScrollAreaContent(props, ref) {
  const {
    scrollDirection,
    getCanScrollMore,
    style,
    handleDragOver
  } = props;
  const apiRef = useGridApiContext();
  const [canScrollMore, setCanScrollMore] = React.useState(getCanScrollMore);
  const rootProps = useGridRootProps();
  const ownerState = _extends({}, rootProps, {
    scrollDirection
  });
  const classes = useUtilityClasses(ownerState);
  const handleScrolling = () => {
    setCanScrollMore(getCanScrollMore);
  };
  useGridEvent(apiRef, 'scrollPositionChange', handleScrolling);
  if (!canScrollMore) {
    return null;
  }
  return /*#__PURE__*/_jsx(GridScrollAreaRawRoot, {
    ref: ref,
    className: classes.root,
    ownerState: ownerState,
    onDragOver: handleDragOver,
    style: style
  });
});
if (process.env.NODE_ENV !== "production") GridScrollAreaContent.displayName = "GridScrollAreaContent";
export const GridScrollArea = fastMemo(GridScrollAreaWrapper);