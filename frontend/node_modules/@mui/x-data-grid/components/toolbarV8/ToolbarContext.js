"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarContext = void 0;
exports.useToolbarContext = useToolbarContext;
var React = _interopRequireWildcard(require("react"));
const ToolbarContext = exports.ToolbarContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") ToolbarContext.displayName = "ToolbarContext";
function useToolbarContext() {
  const context = React.useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('MUI X: Missing context. Toolbar subcomponents must be placed within a <Toolbar /> component.');
  }
  return context;
}