'use client';

import * as React from 'react';
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { useGridConfiguration } from "../../hooks/utils/useGridConfiguration.js";
import { jsx as _jsx } from "react/jsx-runtime";
const CLASSNAME_PREFIX = 'MuiDataGridVariables';
const CSSVariablesContext = /*#__PURE__*/React.createContext({
  className: 'unset',
  tag: /*#__PURE__*/_jsx("style", {
    href: "/unset"
  })
});
if (process.env.NODE_ENV !== "production") CSSVariablesContext.displayName = "CSSVariablesContext";
export function useCSSVariablesClass() {
  return React.useContext(CSSVariablesContext).className;
}
export function useCSSVariablesContext() {
  return React.useContext(CSSVariablesContext);
}
export function GridPortalWrapper({
  children
}) {
  const className = useCSSVariablesClass();
  return /*#__PURE__*/_jsx("div", {
    className: className,
    children: children
  });
}
export function GridCSSVariablesContext(props) {
  const config = useGridConfiguration();
  const rootProps = useGridRootProps();
  const description = config.hooks.useCSSVariables();
  const context = React.useMemo(() => {
    const className = `${CLASSNAME_PREFIX}-${description.id}`;
    const cssString = `.${className}{${variablesToString(description.variables)}}`;
    const tag = /*#__PURE__*/_jsx("style", {
      href: `/${className}`,
      nonce: rootProps.nonce,
      children: cssString
    });
    return {
      className,
      tag
    };
  }, [rootProps.nonce, description]);
  return /*#__PURE__*/_jsx(CSSVariablesContext.Provider, {
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