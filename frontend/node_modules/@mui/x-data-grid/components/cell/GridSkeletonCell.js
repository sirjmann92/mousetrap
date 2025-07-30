"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridSkeletonCell = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _capitalize = _interopRequireDefault(require("@mui/utils/capitalize"));
var _fastMemo = require("@mui/x-internals/fastMemo");
var _utils = require("../../utils/utils");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridClasses = require("../../constants/gridClasses");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["field", "type", "align", "width", "height", "empty", "style", "className"];
const CIRCULAR_CONTENT_SIZE = '1.3em';
const CONTENT_HEIGHT = '1.2em';
const DEFAULT_CONTENT_WIDTH_RANGE = [40, 80];
const CONTENT_WIDTH_RANGE_BY_TYPE = {
  number: [40, 60],
  string: [40, 80],
  date: [40, 60],
  dateTime: [60, 80],
  singleSelect: [40, 80]
};
const useUtilityClasses = ownerState => {
  const {
    align,
    classes,
    empty
  } = ownerState;
  const slots = {
    root: ['cell', 'cellSkeleton', `cell--text${align ? (0, _capitalize.default)(align) : 'Left'}`, empty && 'cellEmpty']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const randomNumberGenerator = (0, _utils.createRandomNumberGenerator)(12345);
function GridSkeletonCell(props) {
  const {
      field,
      type,
      align,
      width,
      height,
      empty = false,
      style,
      className
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = {
    classes: rootProps.classes,
    align,
    empty
  };
  const classes = useUtilityClasses(ownerState);

  // Memo prevents the non-circular skeleton widths changing to random widths on every render
  const skeletonProps = React.useMemo(() => {
    const isCircularContent = type === 'boolean' || type === 'actions';
    if (isCircularContent) {
      return {
        variant: 'circular',
        width: CIRCULAR_CONTENT_SIZE,
        height: CIRCULAR_CONTENT_SIZE
      };
    }

    // The width of the skeleton is a random number between the min and max values
    // The min and max values are determined by the type of the column
    const [min, max] = type ? CONTENT_WIDTH_RANGE_BY_TYPE[type] ?? DEFAULT_CONTENT_WIDTH_RANGE : DEFAULT_CONTENT_WIDTH_RANGE;
    return {
      variant: 'text',
      width: `${Math.round(randomNumberGenerator(min, max))}%`,
      height: CONTENT_HEIGHT
    };
  }, [type]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", (0, _extends2.default)({
    "data-field": field,
    className: (0, _clsx.default)(classes.root, className),
    style: (0, _extends2.default)({
      height,
      maxWidth: width,
      minWidth: width
    }, style)
  }, other, {
    children: !empty && /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseSkeleton, (0, _extends2.default)({}, skeletonProps))
  }));
}
process.env.NODE_ENV !== "production" ? GridSkeletonCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  align: _propTypes.default.string,
  /**
   * If `true`, the cell will not display the skeleton but still reserve the cell space.
   * @default false
   */
  empty: _propTypes.default.bool,
  field: _propTypes.default.string,
  height: _propTypes.default.oneOfType([_propTypes.default.oneOf(['auto']), _propTypes.default.number]),
  type: _propTypes.default.oneOf(['actions', 'boolean', 'custom', 'date', 'dateTime', 'number', 'singleSelect', 'string']),
  width: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string])
} : void 0;
const Memoized = exports.GridSkeletonCell = (0, _fastMemo.fastMemo)(GridSkeletonCell);