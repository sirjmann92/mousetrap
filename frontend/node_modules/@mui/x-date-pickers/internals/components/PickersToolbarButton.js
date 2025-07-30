"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickersToolbarButton = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _PickersToolbarText = require("./PickersToolbarText");
var _pickersToolbarClasses = require("./pickersToolbarClasses");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["align", "className", "classes", "selected", "typographyClassName", "value", "variant", "width"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return (0, _composeClasses.default)(slots, _pickersToolbarClasses.getPickersToolbarUtilityClass, classes);
};
const PickersToolbarButtonRoot = (0, _styles.styled)(_Button.default, {
  name: 'MuiPickersToolbarButton',
  slot: 'Root'
})({
  padding: 0,
  minWidth: 16,
  textTransform: 'none'
});
const PickersToolbarButton = exports.PickersToolbarButton = /*#__PURE__*/React.forwardRef(function PickersToolbarButton(inProps, ref) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiPickersToolbarButton'
  });
  const {
      align,
      className,
      classes: classesProp,
      selected,
      typographyClassName,
      value,
      variant,
      width
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const classes = useUtilityClasses(classesProp);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersToolbarButtonRoot, (0, _extends2.default)({
    variant: "text",
    ref: ref,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: props
  }, width ? {
    sx: {
      width
    }
  } : {}, other, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_PickersToolbarText.PickersToolbarText, {
      align: align,
      className: typographyClassName,
      variant: variant,
      value: value,
      selected: selected
    })
  }));
});
if (process.env.NODE_ENV !== "production") PickersToolbarButton.displayName = "PickersToolbarButton";