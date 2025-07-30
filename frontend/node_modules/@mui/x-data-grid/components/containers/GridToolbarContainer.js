"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbarContainer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _system = require("@mui/system");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _cssVariables = require("../../constants/cssVariables");
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _toolbarV = require("../toolbarV8");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "children"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['toolbarContainer']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridToolbarContainerRoot = (0, _system.styled)(_toolbarV.Toolbar, {
  name: 'MuiDataGrid',
  slot: 'ToolbarContainer',
  shouldForwardProp: prop => prop !== 'ownerState'
})({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: _cssVariables.vars.spacing(1),
  padding: _cssVariables.vars.spacing(0.5),
  minHeight: 'auto'
});

/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/toolbar/ Toolbar} component instead. This component will be removed in a future major release.
 */
const GridToolbarContainer = exports.GridToolbarContainer = (0, _forwardRef.forwardRef)(function GridToolbarContainer(props, ref) {
  const {
      className,
      children
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  if (!children) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridToolbarContainerRoot, (0, _extends2.default)({
    className: (0, _clsx.default)(classes.root, className),
    ownerState: rootProps
  }, other, {
    ref: ref,
    children: children
  }));
});
if (process.env.NODE_ENV !== "production") GridToolbarContainer.displayName = "GridToolbarContainer";
process.env.NODE_ENV !== "production" ? GridToolbarContainer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;