"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridRoot = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _capitalize = _interopRequireDefault(require("@mui/utils/capitalize"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _fastMemo = require("@mui/x-internals/fastMemo");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _GridRootStyles = require("./GridRootStyles");
var _context = require("../../utils/css/context");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _useGridPrivateApiContext = require("../../hooks/utils/useGridPrivateApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../constants/gridClasses");
var _densitySelector = require("../../hooks/features/density/densitySelector");
var _useIsSSR = require("../../hooks/utils/useIsSSR");
var _GridHeader = require("../GridHeader");
var _base = require("../base");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "children", "sidePanel"];
const useUtilityClasses = (ownerState, density) => {
  const {
    autoHeight,
    classes,
    showCellVerticalBorder
  } = ownerState;
  const slots = {
    root: ['root', autoHeight && 'autoHeight', `root--density${(0, _capitalize.default)(density)}`, ownerState.slots.toolbar === null && 'root--noToolbar', 'withBorderColor', showCellVerticalBorder && 'withVerticalBorder']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridRoot = (0, _forwardRef.forwardRef)(function GridRoot(props, ref) {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
      className,
      children,
      sidePanel
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridPrivateApiContext.useGridPrivateApiContext)();
  const density = (0, _useGridSelector.useGridSelector)(apiRef, _densitySelector.gridDensitySelector);
  const rootElementRef = apiRef.current.rootElementRef;
  const rootMountCallback = React.useCallback(node => {
    if (node === null) {
      return;
    }
    apiRef.current.publishEvent('rootMount', node);
  }, [apiRef]);
  const handleRef = (0, _useForkRef.default)(rootElementRef, ref, rootMountCallback);
  const ownerState = rootProps;
  const classes = useUtilityClasses(ownerState, density);
  const cssVariables = (0, _context.useCSSVariablesContext)();
  const isSSR = (0, _useIsSSR.useIsSSR)();
  if (isSSR) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_GridRootStyles.GridRootStyles, (0, _extends2.default)({
    className: (0, _clsx.default)(classes.root, className, cssVariables.className, sidePanel && _gridClasses.gridClasses.withSidePanel),
    ownerState: ownerState
  }, other, {
    ref: handleRef,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: _gridClasses.gridClasses.mainContent,
      role: "presentation",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_GridHeader.GridHeader, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_base.GridBody, {
        children: children
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_base.GridFooterPlaceholder, {})]
    }), sidePanel, cssVariables.tag]
  }));
});
if (process.env.NODE_ENV !== "production") GridRoot.displayName = "GridRoot";
process.env.NODE_ENV !== "production" ? GridRoot.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sidePanel: _propTypes.default.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;
const MemoizedGridRoot = exports.GridRoot = (0, _fastMemo.fastMemo)(GridRoot);