"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnHeaderSeparatorSides = exports.GridColumnHeaderSeparator = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _capitalize = _interopRequireDefault(require("@mui/utils/capitalize"));
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["resizable", "resizing", "height", "side"];
var GridColumnHeaderSeparatorSides = exports.GridColumnHeaderSeparatorSides = /*#__PURE__*/function (GridColumnHeaderSeparatorSides) {
  GridColumnHeaderSeparatorSides["Left"] = "left";
  GridColumnHeaderSeparatorSides["Right"] = "right";
  return GridColumnHeaderSeparatorSides;
}(GridColumnHeaderSeparatorSides || {});
const useUtilityClasses = ownerState => {
  const {
    resizable,
    resizing,
    classes,
    side
  } = ownerState;
  const slots = {
    root: ['columnSeparator', resizable && 'columnSeparator--resizable', resizing && 'columnSeparator--resizing', side && `columnSeparator--side${(0, _capitalize.default)(side)}`],
    icon: ['iconSeparator']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
function GridColumnHeaderSeparatorRaw(props) {
  const {
      height,
      side = GridColumnHeaderSeparatorSides.Right
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = (0, _extends2.default)({}, props, {
    side,
    classes: rootProps.classes
  });
  const classes = useUtilityClasses(ownerState);
  const stopClick = React.useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
  }, []);
  return (
    /*#__PURE__*/
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    (0, _jsxRuntime.jsx)("div", (0, _extends2.default)({
      className: classes.root,
      style: {
        minHeight: height
      }
    }, other, {
      onClick: stopClick,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.columnResizeIcon, {
        className: classes.icon
      })
    }))
  );
}
const GridColumnHeaderSeparator = exports.GridColumnHeaderSeparator = /*#__PURE__*/React.memo(GridColumnHeaderSeparatorRaw);
if (process.env.NODE_ENV !== "production") GridColumnHeaderSeparator.displayName = "GridColumnHeaderSeparator";
process.env.NODE_ENV !== "production" ? GridColumnHeaderSeparatorRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  height: _propTypes.default.number.isRequired,
  resizable: _propTypes.default.bool.isRequired,
  resizing: _propTypes.default.bool.isRequired,
  side: _propTypes.default.oneOf(['left', 'right'])
} : void 0;