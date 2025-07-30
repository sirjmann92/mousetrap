"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickersToolbar = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Typography = _interopRequireDefault(require("@mui/material/Typography"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _createStyled = require("@mui/system/createStyled");
var _pickersToolbarClasses = require("./pickersToolbarClasses");
var _useToolbarOwnerState = require("../hooks/useToolbarOwnerState");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["children", "className", "classes", "toolbarTitle", "hidden", "titleId", "classes", "landscapeDirection"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    title: ['title'],
    content: ['content']
  };
  return (0, _composeClasses.default)(slots, _pickersToolbarClasses.getPickersToolbarUtilityClass, classes);
};
const PickersToolbarRoot = (0, _styles.styled)('div', {
  name: 'MuiPickersToolbar',
  slot: 'Root'
})(({
  theme
}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      height: 'auto',
      maxWidth: 160,
      padding: 16,
      justifyContent: 'flex-start',
      flexWrap: 'wrap'
    }
  }]
}));
const PickersToolbarContent = (0, _styles.styled)('div', {
  name: 'MuiPickersToolbar',
  slot: 'Content',
  shouldForwardProp: prop => (0, _createStyled.shouldForwardProp)(prop) && prop !== 'landscapeDirection'
})({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  flex: 1,
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column'
    }
  }, {
    props: {
      pickerOrientation: 'landscape',
      landscapeDirection: 'row'
    },
    style: {
      flexDirection: 'row'
    }
  }]
});
const PickersToolbar = exports.PickersToolbar = /*#__PURE__*/React.forwardRef(function PickersToolbar(inProps, ref) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiPickersToolbar'
  });
  const {
      children,
      className,
      classes: classesProp,
      toolbarTitle,
      hidden,
      titleId,
      landscapeDirection
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const ownerState = (0, _useToolbarOwnerState.useToolbarOwnerState)();
  const classes = useUtilityClasses(classesProp);
  if (hidden) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(PickersToolbarRoot, (0, _extends2.default)({
    ref: ref,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState
  }, other, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Typography.default, {
      color: "text.secondary",
      variant: "overline",
      id: titleId,
      className: classes.title,
      children: toolbarTitle
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersToolbarContent, {
      className: classes.content,
      ownerState: ownerState,
      landscapeDirection: landscapeDirection,
      children: children
    })]
  }));
});
if (process.env.NODE_ENV !== "production") PickersToolbar.displayName = "PickersToolbar";