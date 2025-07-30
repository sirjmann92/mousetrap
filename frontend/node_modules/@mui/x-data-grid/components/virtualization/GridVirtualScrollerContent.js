"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridVirtualScrollerContent = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _system = require("@mui/system");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../constants/gridClasses");
var _jsxRuntime = require("react/jsx-runtime");
const useUtilityClasses = (props, overflowedContent) => {
  const {
    classes
  } = props;
  const slots = {
    root: ['virtualScrollerContent', overflowedContent && 'virtualScrollerContent--overflowed']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const VirtualScrollerContentRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'VirtualScrollerContent',
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [styles.virtualScrollerContent, ownerState.overflowedContent && styles['virtualScrollerContent--overflowed']];
  }
})({});
const GridVirtualScrollerContent = exports.GridVirtualScrollerContent = (0, _forwardRef.forwardRef)(function GridVirtualScrollerContent(props, ref) {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const overflowedContent = !rootProps.autoHeight && props.style?.minHeight === 'auto';
  const classes = useUtilityClasses(rootProps, overflowedContent);
  const ownerState = {
    classes: rootProps.classes,
    overflowedContent
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(VirtualScrollerContentRoot, (0, _extends2.default)({}, props, {
    ownerState: ownerState,
    className: (0, _clsx.default)(classes.root, props.className),
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") GridVirtualScrollerContent.displayName = "GridVirtualScrollerContent";