"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickersFadeTransitionGroup = PickersFadeTransitionGroup;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _reactTransitionGroup = require("react-transition-group");
var _Fade = _interopRequireDefault(require("@mui/material/Fade"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _pickersFadeTransitionGroupClasses = require("./pickersFadeTransitionGroupClasses");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["children"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return (0, _composeClasses.default)(slots, _pickersFadeTransitionGroupClasses.getPickersFadeTransitionGroupUtilityClass, classes);
};
const PickersFadeTransitionGroupRoot = (0, _styles.styled)(_reactTransitionGroup.TransitionGroup, {
  name: 'MuiPickersFadeTransitionGroup',
  slot: 'Root'
})({
  display: 'block',
  position: 'relative'
});

/**
 * @ignore - do not document.
 */
function PickersFadeTransitionGroup(inProps) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiPickersFadeTransitionGroup'
  });
  const {
    className,
    reduceAnimations,
    transKey,
    classes: classesProp
  } = props;
  const {
      children
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const classes = useUtilityClasses(classesProp);
  const theme = (0, _styles.useTheme)();
  if (reduceAnimations) {
    return children;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersFadeTransitionGroupRoot, {
    className: (0, _clsx.default)(classes.root, className),
    ownerState: other,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Fade.default, {
      appear: false,
      mountOnEnter: true,
      unmountOnExit: true,
      timeout: {
        appear: theme.transitions.duration.enteringScreen,
        enter: theme.transitions.duration.enteringScreen,
        exit: 0
      },
      children: children
    }, transKey)
  });
}