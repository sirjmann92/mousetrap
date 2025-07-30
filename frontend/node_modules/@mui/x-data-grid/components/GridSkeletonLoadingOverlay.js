"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridSkeletonLoadingOverlayInner = exports.GridSkeletonLoadingOverlay = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _system = require("@mui/system");
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _hooks = require("../hooks");
var _constants = require("../internals/constants");
var _gridDimensionsSelectors = require("../hooks/features/dimensions/gridDimensionsSelectors");
var _gridClasses = require("../constants/gridClasses");
var _getPinnedCellOffset = require("../internals/utils/getPinnedCellOffset");
var _cellBorderUtils = require("../utils/cellBorderUtils");
var _domUtils = require("../utils/domUtils");
var _GridScrollbarFillerCell = require("./GridScrollbarFillerCell");
var _rtlFlipSide = require("../utils/rtlFlipSide");
var _utils = require("../internals/utils");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["skeletonRowsCount", "visibleColumns", "showFirstRowBorder"];
const SkeletonOverlay = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'SkeletonLoadingOverlay'
})({
  minWidth: '100%',
  width: 'max-content',
  // prevents overflow: clip; cutting off the x axis
  height: '100%',
  overflow: 'clip' // y axis is hidden while the x axis is allowed to overflow
});
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['skeletonLoadingOverlay']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const getColIndex = el => parseInt(el.getAttribute('data-colindex'), 10);
const GridSkeletonLoadingOverlayInner = exports.GridSkeletonLoadingOverlayInner = (0, _forwardRef.forwardRef)(function GridSkeletonLoadingOverlayInner(props, forwardedRef) {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
    slots
  } = rootProps;
  const isRtl = (0, _RtlProvider.useRtl)();
  const classes = useUtilityClasses({
    classes: rootProps.classes
  });
  const ref = React.useRef(null);
  const handleRef = (0, _useForkRef.default)(ref, forwardedRef);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const dimensions = (0, _hooks.useGridSelector)(apiRef, _hooks.gridDimensionsSelector);
  const totalWidth = (0, _hooks.useGridSelector)(apiRef, _gridDimensionsSelectors.gridColumnsTotalWidthSelector);
  const positions = (0, _hooks.useGridSelector)(apiRef, _hooks.gridColumnPositionsSelector);
  const inViewportCount = React.useMemo(() => positions.filter(value => value <= totalWidth).length, [totalWidth, positions]);
  const {
      skeletonRowsCount,
      visibleColumns,
      showFirstRowBorder
    } = props,
    rest = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const allVisibleColumns = (0, _hooks.useGridSelector)(apiRef, _hooks.gridVisibleColumnDefinitionsSelector);
  const columns = React.useMemo(() => allVisibleColumns.slice(0, inViewportCount), [allVisibleColumns, inViewportCount]);
  const pinnedColumns = (0, _hooks.useGridSelector)(apiRef, _hooks.gridVisiblePinnedColumnDefinitionsSelector);
  const getPinnedPosition = React.useCallback(field => {
    if (pinnedColumns.left.findIndex(col => col.field === field) !== -1) {
      return _constants.PinnedColumnPosition.LEFT;
    }
    if (pinnedColumns.right.findIndex(col => col.field === field) !== -1) {
      return _constants.PinnedColumnPosition.RIGHT;
    }
    return undefined;
  }, [pinnedColumns.left, pinnedColumns.right]);
  const children = React.useMemo(() => {
    const array = [];
    for (let i = 0; i < skeletonRowsCount; i += 1) {
      const rowCells = [];
      for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
        const column = columns[colIndex];
        const pinnedPosition = getPinnedPosition(column.field);
        const isPinnedLeft = pinnedPosition === _constants.PinnedColumnPosition.LEFT;
        const isPinnedRight = pinnedPosition === _constants.PinnedColumnPosition.RIGHT;
        const pinnedSide = (0, _rtlFlipSide.rtlFlipSide)(pinnedPosition, isRtl);
        const sectionLength = pinnedSide ? pinnedColumns[pinnedSide].length // pinned section
        : columns.length - pinnedColumns.left.length - pinnedColumns.right.length; // middle section
        const sectionIndex = pinnedSide ? pinnedColumns[pinnedSide].findIndex(col => col.field === column.field) // pinned section
        : colIndex - pinnedColumns.left.length; // middle section
        const scrollbarWidth = dimensions.hasScrollY ? dimensions.scrollbarSize : 0;
        const pinnedStyle = (0, _utils.attachPinnedStyle)({}, isRtl, pinnedPosition, (0, _getPinnedCellOffset.getPinnedCellOffset)(pinnedPosition, column.computedWidth, colIndex, positions, dimensions.columnsTotalWidth, scrollbarWidth));
        const gridHasFiller = dimensions.columnsTotalWidth < dimensions.viewportOuterSize.width;
        const showRightBorder = (0, _cellBorderUtils.shouldCellShowRightBorder)(pinnedPosition, sectionIndex, sectionLength, rootProps.showCellVerticalBorder, gridHasFiller);
        const showLeftBorder = (0, _cellBorderUtils.shouldCellShowLeftBorder)(pinnedPosition, sectionIndex);
        const isLastColumn = colIndex === columns.length - 1;
        const isFirstPinnedRight = isPinnedRight && sectionIndex === 0;
        const hasFillerBefore = isFirstPinnedRight && gridHasFiller;
        const hasFillerAfter = isLastColumn && !isFirstPinnedRight && gridHasFiller;
        const expandedWidth = dimensions.viewportOuterSize.width - dimensions.columnsTotalWidth;
        const emptyCellWidth = Math.max(0, expandedWidth);
        const emptyCell = /*#__PURE__*/(0, _jsxRuntime.jsx)(slots.skeletonCell, {
          width: emptyCellWidth,
          empty: true
        }, `skeleton-filler-column-${i}`);
        const hasScrollbarFiller = isLastColumn && scrollbarWidth !== 0;
        if (hasFillerBefore) {
          rowCells.push(emptyCell);
        }
        rowCells.push(/*#__PURE__*/(0, _jsxRuntime.jsx)(slots.skeletonCell, {
          field: column.field,
          type: column.type,
          align: column.align,
          width: "var(--width)",
          height: dimensions.rowHeight,
          "data-colindex": colIndex,
          empty: visibleColumns && !visibleColumns.has(column.field),
          className: (0, _clsx.default)(isPinnedLeft && _gridClasses.gridClasses['cell--pinnedLeft'], isPinnedRight && _gridClasses.gridClasses['cell--pinnedRight'], showRightBorder && _gridClasses.gridClasses['cell--withRightBorder'], showLeftBorder && _gridClasses.gridClasses['cell--withLeftBorder']),
          style: (0, _extends2.default)({
            '--width': `${column.computedWidth}px`
          }, pinnedStyle)
        }, `skeleton-column-${i}-${column.field}`));
        if (hasFillerAfter) {
          rowCells.push(emptyCell);
        }
        if (hasScrollbarFiller) {
          rowCells.push(/*#__PURE__*/(0, _jsxRuntime.jsx)(_GridScrollbarFillerCell.GridScrollbarFillerCell, {
            pinnedRight: pinnedColumns.right.length > 0
          }, `skeleton-scrollbar-filler-${i}`));
        }
      }
      array.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: (0, _clsx.default)(_gridClasses.gridClasses.row, _gridClasses.gridClasses.rowSkeleton, i === 0 && !showFirstRowBorder && _gridClasses.gridClasses['row--firstVisible']),
        children: rowCells
      }, `skeleton-row-${i}`));
    }
    return array;
  }, [skeletonRowsCount, columns, getPinnedPosition, isRtl, pinnedColumns, dimensions.hasScrollY, dimensions.scrollbarSize, dimensions.columnsTotalWidth, dimensions.viewportOuterSize.width, dimensions.rowHeight, positions, rootProps.showCellVerticalBorder, slots, visibleColumns, showFirstRowBorder]);

  // Sync the column resize of the overlay columns with the grid
  const handleColumnResize = params => {
    const {
      colDef,
      width
    } = params;
    const cells = ref.current?.querySelectorAll(`[data-field="${(0, _domUtils.escapeOperandAttributeSelector)(colDef.field)}"]`);
    if (!cells) {
      throw new Error('MUI X: Expected skeleton cells to be defined with `data-field` attribute.');
    }
    const resizedColIndex = columns.findIndex(col => col.field === colDef.field);
    const pinnedPosition = getPinnedPosition(colDef.field);
    const isPinnedLeft = pinnedPosition === _constants.PinnedColumnPosition.LEFT;
    const isPinnedRight = pinnedPosition === _constants.PinnedColumnPosition.RIGHT;
    const currentWidth = getComputedStyle(cells[0]).getPropertyValue('--width');
    const delta = parseInt(currentWidth, 10) - width;
    if (cells) {
      cells.forEach(element => {
        element.style.setProperty('--width', `${width}px`);
      });
    }
    if (isPinnedLeft) {
      const pinnedCells = ref.current?.querySelectorAll(`.${_gridClasses.gridClasses['cell--pinnedLeft']}`);
      pinnedCells?.forEach(element => {
        const colIndex = getColIndex(element);
        if (colIndex > resizedColIndex) {
          element.style.left = `${parseInt(getComputedStyle(element).left, 10) - delta}px`;
        }
      });
    }
    if (isPinnedRight) {
      const pinnedCells = ref.current?.querySelectorAll(`.${_gridClasses.gridClasses['cell--pinnedRight']}`);
      pinnedCells?.forEach(element => {
        const colIndex = getColIndex(element);
        if (colIndex < resizedColIndex) {
          element.style.right = `${parseInt(getComputedStyle(element).right, 10) + delta}px`;
        }
      });
    }
  };
  (0, _hooks.useGridEvent)(apiRef, 'columnResize', handleColumnResize);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(SkeletonOverlay, (0, _extends2.default)({
    className: classes.root
  }, rest, {
    ref: handleRef,
    children: children
  }));
});
if (process.env.NODE_ENV !== "production") GridSkeletonLoadingOverlayInner.displayName = "GridSkeletonLoadingOverlayInner";
const GridSkeletonLoadingOverlay = exports.GridSkeletonLoadingOverlay = (0, _forwardRef.forwardRef)(function GridSkeletonLoadingOverlay(props, forwardedRef) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const dimensions = (0, _hooks.useGridSelector)(apiRef, _hooks.gridDimensionsSelector);
  const viewportHeight = dimensions?.viewportInnerSize.height ?? 0;
  const skeletonRowsCount = Math.ceil(viewportHeight / dimensions.rowHeight);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridSkeletonLoadingOverlayInner, (0, _extends2.default)({}, props, {
    skeletonRowsCount: skeletonRowsCount,
    ref: forwardedRef
  }));
});
if (process.env.NODE_ENV !== "production") GridSkeletonLoadingOverlay.displayName = "GridSkeletonLoadingOverlay";