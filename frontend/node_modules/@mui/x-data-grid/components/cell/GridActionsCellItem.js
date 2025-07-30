"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridActionsCellItem = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["label", "icon", "showInMenu", "onClick"],
  _excluded2 = ["label", "icon", "showInMenu", "onClick", "closeMenuOnClick", "closeMenu"];
const GridActionsCellItem = exports.GridActionsCellItem = (0, _forwardRef.forwardRef)((props, ref) => {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  if (!props.showInMenu) {
    const {
        label,
        icon,
        onClick
      } = props,
      other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
    const handleClick = event => {
      onClick?.(event);
    };
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseIconButton, (0, _extends2.default)({
      size: "small",
      role: "menuitem",
      "aria-label": label
    }, other, {
      onClick: handleClick
    }, rootProps.slotProps?.baseIconButton, {
      ref: ref,
      children: /*#__PURE__*/React.cloneElement(icon, {
        fontSize: 'small'
      })
    }));
  }
  const {
      label,
      icon,
      onClick,
      closeMenuOnClick = true,
      closeMenu
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded2);
  const handleClick = event => {
    onClick?.(event);
    if (closeMenuOnClick) {
      closeMenu?.();
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, (0, _extends2.default)({
    ref: ref
  }, other, {
    onClick: handleClick,
    iconStart: icon,
    children: label
  }));
});
if (process.env.NODE_ENV !== "production") GridActionsCellItem.displayName = "GridActionsCellItem";
process.env.NODE_ENV !== "production" ? GridActionsCellItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: _propTypes.default.string,
  /**
   * from https://mui.com/material-ui/api/button-base/#ButtonBase-prop-component
   */
  component: _propTypes.default.elementType,
  disabled: _propTypes.default.bool,
  icon: _propTypes.default /* @typescript-to-proptypes-ignore */.oneOfType([_propTypes.default.element, _propTypes.default.func, _propTypes.default.number, _propTypes.default.object, _propTypes.default.string, _propTypes.default.bool]),
  label: _propTypes.default.node,
  showInMenu: _propTypes.default.bool,
  style: _propTypes.default.object
} : void 0;