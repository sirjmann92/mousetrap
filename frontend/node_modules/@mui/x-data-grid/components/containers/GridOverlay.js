"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridOverlay = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _system = require("@mui/system");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _cssVariables = require("../../constants/cssVariables");
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['overlay']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridOverlayRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'Overlay'
})({
  width: '100%',
  height: '100%',
  display: 'flex',
  gap: _cssVariables.vars.spacing(1),
  flexDirection: 'column',
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  textWrap: 'balance',
  backgroundColor: _cssVariables.vars.colors.background.backdrop
});
const GridOverlay = exports.GridOverlay = (0, _forwardRef.forwardRef)(function GridOverlay(props, ref) {
  const {
      className
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridOverlayRoot, (0, _extends2.default)({
    className: (0, _clsx.default)(classes.root, className),
    ownerState: rootProps
  }, other, {
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") GridOverlay.displayName = "GridOverlay";
process.env.NODE_ENV !== "production" ? GridOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;