"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridApiContext = useGridApiContext;
var React = _interopRequireWildcard(require("react"));
var _GridApiContext = require("../../components/GridApiContext");
function useGridApiContext() {
  const apiRef = React.useContext(_GridApiContext.GridApiContext);
  if (apiRef === undefined) {
    throw new Error(['MUI X: Could not find the Data Grid context.', 'It looks like you rendered your component outside of a DataGrid, DataGridPro or DataGridPremium parent component.', 'This can also happen if you are bundling multiple versions of the Data Grid.'].join('\n'));
  }
  return apiRef;
}