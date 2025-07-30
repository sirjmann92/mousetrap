"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useComponentRenderer = useComponentRenderer;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
/**
 * Resolves the rendering logic for a component.
 * Handles three scenarios:
 * 1. A render function that receives props and state
 * 2. A React element
 * 3. A default element
 *
 * @ignore - internal hook.
 */
function useComponentRenderer(defaultElement, render, props, state = {}) {
  if (typeof render === 'function') {
    return render(props, state);
  }
  if (render) {
    if (render.props.className) {
      props.className = mergeClassNames(render.props.className, props.className);
    }
    if (render.props.style || props.style) {
      props.style = (0, _extends2.default)({}, props.style, render.props.style);
    }
    return /*#__PURE__*/React.cloneElement(render, props);
  }
  return /*#__PURE__*/React.createElement(defaultElement, props);
}
function mergeClassNames(className, otherClassName) {
  if (!className || !otherClassName) {
    return className || otherClassName;
  }
  return `${className} ${otherClassName}`;
}