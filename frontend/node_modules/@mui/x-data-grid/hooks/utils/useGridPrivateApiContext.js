"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridPrivateApiContext = void 0;
exports.useGridPrivateApiContext = useGridPrivateApiContext;
var React = _interopRequireWildcard(require("react"));
const GridPrivateApiContext = exports.GridPrivateApiContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") GridPrivateApiContext.displayName = "GridPrivateApiContext";
function useGridPrivateApiContext() {
  const privateApiRef = React.useContext(GridPrivateApiContext);
  if (privateApiRef === undefined) {
    throw new Error(['MUI X: Could not find the Data Grid private context.', 'It looks like you rendered your component outside of a DataGrid, DataGridPro or DataGridPremium parent component.', 'This can also happen if you are bundling multiple versions of the Data Grid.'].join('\n'));
  }
  return privateApiRef;
}