"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridOverlayWrapper = GridOverlayWrapper;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _system = require("@mui/system");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _gridRowsUtils = require("../../hooks/features/rows/gridRowsUtils");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _dimensions = require("../../hooks/features/dimensions");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../constants/gridClasses");
var _jsxRuntime = require("react/jsx-runtime");
const GridOverlayWrapperRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'OverlayWrapper',
  shouldForwardProp: prop => prop !== 'overlayType' && prop !== 'loadingOverlayVariant' && prop !== 'right'
})(({
  overlayType,
  loadingOverlayVariant,
  right
}) =>
// Skeleton overlay should flow with the scroll container and not be sticky
loadingOverlayVariant !== 'skeleton' ? {
  position: 'sticky',
  // To stay in place while scrolling
  top: 'var(--DataGrid-headersTotalHeight)',
  // TODO: take pinned rows into account
  left: 0,
  right: `${right}px`,
  width: 0,
  // To stay above the content instead of shifting it down
  height: 0,
  // To stay above the content instead of shifting it down
  zIndex: overlayType === 'loadingOverlay' ? 5 // Should be above pinned columns, pinned rows, and detail panel
  : 4 // Should be above pinned columns and detail panel
} : {});
const GridOverlayWrapperInner = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'OverlayWrapperInner',
  shouldForwardProp: prop => prop !== 'overlayType' && prop !== 'loadingOverlayVariant'
})({});
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['overlayWrapper'],
    inner: ['overlayWrapperInner']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
function GridOverlayWrapper(props) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const dimensions = (0, _useGridSelector.useGridSelector)(apiRef, _dimensions.gridDimensionsSelector);
  let height = Math.max(dimensions.viewportOuterSize.height - dimensions.topContainerHeight - dimensions.bottomContainerHeight - (dimensions.hasScrollX ? dimensions.scrollbarSize : 0), 0);
  if (height === 0) {
    height = _gridRowsUtils.minimalContentHeight;
  }
  const classes = useUtilityClasses((0, _extends2.default)({}, props, {
    classes: rootProps.classes
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridOverlayWrapperRoot, (0, _extends2.default)({
    className: classes.root
  }, props, {
    right: dimensions.columnsTotalWidth - dimensions.viewportOuterSize.width,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(GridOverlayWrapperInner, (0, _extends2.default)({
      className: classes.inner,
      style: {
        height,
        width: dimensions.viewportOuterSize.width
      }
    }, props))
  }));
}
process.env.NODE_ENV !== "production" ? GridOverlayWrapper.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  loadingOverlayVariant: _propTypes.default.oneOf(['circular-progress', 'linear-progress', 'skeleton']),
  overlayType: _propTypes.default.oneOf(['loadingOverlay', 'noResultsOverlay', 'noRowsOverlay', 'noColumnsOverlay', 'emptyPivotOverlay'])
} : void 0;