"use strict";
'use client';

/* eslint-disable @typescript-eslint/no-use-before-define */
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridScrollArea = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _system = require("@mui/system");
var _fastMemo = require("@mui/x-internals/fastMemo");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _constants = require("../constants");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _useGridEvent = require("../hooks/utils/useGridEvent");
var _useGridSelector = require("../hooks/utils/useGridSelector");
var _gridDimensionsSelectors = require("../hooks/features/dimensions/gridDimensionsSelectors");
var _densitySelector = require("../hooks/features/density/densitySelector");
var _useTimeout = require("../hooks/utils/useTimeout");
var _gridColumnsUtils = require("../hooks/features/columns/gridColumnsUtils");
var _createSelector = require("../utils/createSelector");
var _gridRowsMetaSelector = require("../hooks/features/rows/gridRowsMetaSelector");
var _jsxRuntime = require("react/jsx-runtime");
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
  return (0, _composeClasses.default)(slots, _constants.getDataGridUtilityClass, classes);
};
const GridScrollAreaRawRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'ScrollArea',
  overridesResolver: (props, styles) => [{
    [`&.${_constants.gridClasses['scrollArea--left']}`]: styles['scrollArea--left']
  }, {
    [`&.${_constants.gridClasses['scrollArea--right']}`]: styles['scrollArea--right']
  }, {
    [`&.${_constants.gridClasses['scrollArea--up']}`]: styles['scrollArea--up']
  }, {
    [`&.${_constants.gridClasses['scrollArea--down']}`]: styles['scrollArea--down']
  }, styles.scrollArea]
})(() => ({
  position: 'absolute',
  zIndex: 101,
  // Horizontal scroll areas
  [`&.${_constants.gridClasses['scrollArea--left']}`]: {
    top: 0,
    left: 0,
    width: 20,
    bottom: 0
  },
  [`&.${_constants.gridClasses['scrollArea--right']}`]: {
    top: 0,
    right: 0,
    width: 20,
    bottom: 0
  },
  // Vertical scroll areas
  [`&.${_constants.gridClasses['scrollArea--up']}`]: {
    top: 0,
    left: 0,
    right: 0,
    height: 20
  },
  [`&.${_constants.gridClasses['scrollArea--down']}`]: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 20
  }
}));
const offsetSelector = (0, _createSelector.createSelector)(_gridDimensionsSelectors.gridDimensionsSelector, (dimensions, direction) => {
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
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const [dragDirection, setDragDirection] = React.useState('none');

  // Listen for both column and row drag events
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnHeaderDragStart', () => setDragDirection('horizontal'));
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnHeaderDragEnd', () => setDragDirection('none'));
  (0, _useGridEvent.useGridEvent)(apiRef, 'rowDragStart', () => setDragDirection('vertical'));
  (0, _useGridEvent.useGridEvent)(apiRef, 'rowDragEnd', () => setDragDirection('none'));
  if (dragDirection === 'none') {
    return null;
  }
  if (dragDirection === 'horizontal') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridHorizontalScrollAreaContent, (0, _extends2.default)({}, props));
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridVerticalScrollAreaContent, (0, _extends2.default)({}, props));
}
function GridHorizontalScrollAreaContent(props) {
  const {
    scrollDirection,
    scrollPosition
  } = props;
  const rootRef = React.useRef(null);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const timeout = (0, _useTimeout.useTimeout)();
  const densityFactor = (0, _useGridSelector.useGridSelector)(apiRef, _densitySelector.gridDensityFactorSelector);
  const columnsTotalWidth = (0, _useGridSelector.useGridSelector)(apiRef, _gridDimensionsSelectors.gridColumnsTotalWidthSelector);
  const sideOffset = (0, _useGridSelector.useGridSelector)(apiRef, offsetSelector, scrollDirection);
  const getCanScrollMore = () => {
    const dimensions = (0, _gridDimensionsSelectors.gridDimensionsSelector)(apiRef);
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
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const totalHeaderHeight = (0, _gridColumnsUtils.getTotalHeaderHeight)(apiRef, rootProps);
  const headerHeight = Math.floor(rootProps.columnHeaderHeight * densityFactor);
  const style = (0, _extends2.default)({
    height: headerHeight,
    top: totalHeaderHeight - headerHeight
  }, scrollDirection === 'left' ? {
    left: sideOffset
  } : {}, scrollDirection === 'right' ? {
    right: sideOffset
  } : {});
  const handleDragOver = (0, _useEventCallback.default)(event => {
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridScrollAreaContent, (0, _extends2.default)({}, props, {
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
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const timeout = (0, _useTimeout.useTimeout)();
  const rowsMeta = (0, _useGridSelector.useGridSelector)(apiRef, _gridRowsMetaSelector.gridRowsMetaSelector);
  const getCanScrollMore = () => {
    const dimensions = (0, _gridDimensionsSelectors.gridDimensionsSelector)(apiRef);
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
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const totalHeaderHeight = (0, _gridColumnsUtils.getTotalHeaderHeight)(apiRef, rootProps);
  const style = {
    top: scrollDirection === 'up' ? totalHeaderHeight : undefined,
    bottom: scrollDirection === 'down' ? 0 : undefined
  };
  const handleDragOver = (0, _useEventCallback.default)(event => {
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridScrollAreaContent, (0, _extends2.default)({}, props, {
    ref: rootRef,
    getCanScrollMore: getCanScrollMore,
    style: style,
    handleDragOver: handleDragOver
  }));
}
const GridScrollAreaContent = (0, _forwardRef.forwardRef)(function GridScrollAreaContent(props, ref) {
  const {
    scrollDirection,
    getCanScrollMore,
    style,
    handleDragOver
  } = props;
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const [canScrollMore, setCanScrollMore] = React.useState(getCanScrollMore);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = (0, _extends2.default)({}, rootProps, {
    scrollDirection
  });
  const classes = useUtilityClasses(ownerState);
  const handleScrolling = () => {
    setCanScrollMore(getCanScrollMore);
  };
  (0, _useGridEvent.useGridEvent)(apiRef, 'scrollPositionChange', handleScrolling);
  if (!canScrollMore) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridScrollAreaRawRoot, {
    ref: ref,
    className: classes.root,
    ownerState: ownerState,
    onDragOver: handleDragOver,
    style: style
  });
});
if (process.env.NODE_ENV !== "production") GridScrollAreaContent.displayName = "GridScrollAreaContent";
const GridScrollArea = exports.GridScrollArea = (0, _fastMemo.fastMemo)(GridScrollAreaWrapper);