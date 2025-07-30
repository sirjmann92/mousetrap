"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridContextProvider = GridContextProvider;
var React = _interopRequireWildcard(require("react"));
var _GridApiContext = require("../components/GridApiContext");
var _useGridPrivateApiContext = require("../hooks/utils/useGridPrivateApiContext");
var _GridRootPropsContext = require("./GridRootPropsContext");
var _GridConfigurationContext = require("../components/GridConfigurationContext");
var _GridPanelContext = require("../components/panel/GridPanelContext");
var _context = require("../utils/css/context");
var _jsxRuntime = require("react/jsx-runtime");
function GridContextProvider({
  privateApiRef,
  configuration,
  props,
  children
}) {
  const apiRef = React.useRef(privateApiRef.current.getPublicApi());
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridConfigurationContext.GridConfigurationContext.Provider, {
    value: configuration,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridRootPropsContext.GridRootPropsContext.Provider, {
      value: props,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_useGridPrivateApiContext.GridPrivateApiContext.Provider, {
        value: privateApiRef,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridApiContext.GridApiContext.Provider, {
          value: apiRef,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridPanelContext.GridPanelContextProvider, {
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_context.GridCSSVariablesContext, {
              children: children
            })
          })
        })
      })
    })
  });
}