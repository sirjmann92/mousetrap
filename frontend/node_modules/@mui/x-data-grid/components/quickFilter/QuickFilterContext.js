"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuickFilterContext = void 0;
exports.useQuickFilterContext = useQuickFilterContext;
var React = _interopRequireWildcard(require("react"));
const QuickFilterContext = exports.QuickFilterContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") QuickFilterContext.displayName = "QuickFilterContext";
function useQuickFilterContext() {
  const context = React.useContext(QuickFilterContext);
  if (context === undefined) {
    throw new Error('MUI X: Missing context. Quick Filter subcomponents must be placed within a <QuickFilter /> component.');
  }
  return context;
}