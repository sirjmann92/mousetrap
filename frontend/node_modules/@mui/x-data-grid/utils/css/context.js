"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridCSSVariablesContext = GridCSSVariablesContext;
exports.GridPortalWrapper = GridPortalWrapper;
exports.useCSSVariablesClass = useCSSVariablesClass;
exports.useCSSVariablesContext = useCSSVariablesContext;
var React = _interopRequireWildcard(require("react"));
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _useGridConfiguration = require("../../hooks/utils/useGridConfiguration");
var _jsxRuntime = require("react/jsx-runtime");
const CLASSNAME_PREFIX = 'MuiDataGridVariables';
const CSSVariablesContext = /*#__PURE__*/React.createContext({
  className: 'unset',
  tag: /*#__PURE__*/(0, _jsxRuntime.jsx)("style", {
    href: "/unset"
  })
});
if (process.env.NODE_ENV !== "production") CSSVariablesContext.displayName = "CSSVariablesContext";
function useCSSVariablesClass() {
  return React.useContext(CSSVariablesContext).className;
}
function useCSSVariablesContext() {
  return React.useContext(CSSVariablesContext);
}
function GridPortalWrapper({
  children
}) {
  const className = useCSSVariablesClass();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: className,
    children: children
  });
}
function GridCSSVariablesContext(props) {
  const config = (0, _useGridConfiguration.useGridConfiguration)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const description = config.hooks.useCSSVariables();
  const context = React.useMemo(() => {
    const className = `${CLASSNAME_PREFIX}-${description.id}`;
    const cssString = `.${className}{${variablesToString(description.variables)}}`;
    const tag = /*#__PURE__*/(0, _jsxRuntime.jsx)("style", {
      href: `/${className}`,
      nonce: rootProps.nonce,
      children: cssString
    });
    return {
      className,
      tag
    };
  }, [rootProps.nonce, description]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(CSSVariablesContext.Provider, {
    value: context,
    children: props.children
  });
}
function variablesToString(variables) {
  let output = '';
  for (const key in variables) {
    if (Object.hasOwn(variables, key) && variables[key] !== undefined) {
      output += `${key}:${variables[key]};`;
    }
  }
  return output;
}