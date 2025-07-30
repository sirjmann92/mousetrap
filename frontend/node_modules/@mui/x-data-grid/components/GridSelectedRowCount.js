"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridSelectedRowCount = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _system = require("@mui/system");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _cssVariables = require("../constants/cssVariables");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _gridClasses = require("../constants/gridClasses");
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "selectedRowCount"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['selectedRowCount']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridSelectedRowCountRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'SelectedRowCount'
})({
  alignItems: 'center',
  display: 'flex',
  margin: _cssVariables.vars.spacing(0, 2),
  visibility: 'hidden',
  width: 0,
  height: 0,
  [_cssVariables.vars.breakpoints.up('sm')]: {
    visibility: 'visible',
    width: 'auto',
    height: 'auto'
  }
});
const GridSelectedRowCount = exports.GridSelectedRowCount = (0, _forwardRef.forwardRef)(function GridSelectedRowCount(props, ref) {
  const {
      className,
      selectedRowCount
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const ownerState = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(ownerState);
  const rowSelectedText = apiRef.current.getLocaleText('footerRowSelected')(selectedRowCount);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridSelectedRowCountRoot, (0, _extends2.default)({
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState
  }, other, {
    ref: ref,
    children: rowSelectedText
  }));
});
if (process.env.NODE_ENV !== "production") GridSelectedRowCount.displayName = "GridSelectedRowCount";
process.env.NODE_ENV !== "production" ? GridSelectedRowCount.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  selectedRowCount: _propTypes.default.number.isRequired,
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;