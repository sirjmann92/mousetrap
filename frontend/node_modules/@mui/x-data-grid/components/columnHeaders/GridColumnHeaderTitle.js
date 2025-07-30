"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnHeaderTitle = GridColumnHeaderTitle;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _system = require("@mui/system");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _domUtils = require("../../utils/domUtils");
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "aria-label"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['columnHeaderTitle']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridColumnHeaderTitleRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'ColumnHeaderTitle'
})({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontWeight: 'var(--unstable_DataGrid-headWeight)',
  lineHeight: 'normal'
});
const ColumnHeaderInnerTitle = (0, _forwardRef.forwardRef)(function ColumnHeaderInnerTitle(props, ref) {
  // Tooltip adds aria-label to the props, which is not needed since the children prop is a string
  // See https://github.com/mui/mui-x/pull/14482
  const {
      className
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridColumnHeaderTitleRoot, (0, _extends2.default)({
    className: (0, _clsx.default)(classes.root, className),
    ownerState: rootProps
  }, other, {
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") ColumnHeaderInnerTitle.displayName = "ColumnHeaderInnerTitle";
// No React.memo here as if we display the sort icon, we need to recalculate the isOver
function GridColumnHeaderTitle(props) {
  const {
    label,
    description
  } = props;
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const titleRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState('');
  const handleMouseOver = React.useCallback(() => {
    if (!description && titleRef?.current) {
      const isOver = (0, _domUtils.isOverflown)(titleRef.current);
      if (isOver) {
        setTooltip(label);
      } else {
        setTooltip('');
      }
    }
  }, [description, label]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, (0, _extends2.default)({
    title: description || tooltip
  }, rootProps.slotProps?.baseTooltip, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(ColumnHeaderInnerTitle, {
      onMouseOver: handleMouseOver,
      ref: titleRef,
      children: label
    })
  }));
}
process.env.NODE_ENV !== "production" ? GridColumnHeaderTitle.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  columnWidth: _propTypes.default.number.isRequired,
  description: _propTypes.default.node,
  label: _propTypes.default.string.isRequired
} : void 0;