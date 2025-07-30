"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridConfiguration = void 0;
var React = _interopRequireWildcard(require("react"));
var _GridConfigurationContext = require("../../components/GridConfigurationContext");
const useGridConfiguration = () => {
  const configuration = React.useContext(_GridConfigurationContext.GridConfigurationContext);
  if (configuration === undefined) {
    throw new Error(['MUI X: Could not find the Data Grid configuration context.', 'It looks like you rendered your component outside of a DataGrid, DataGridPro or DataGridPremium parent component.', 'This can also happen if you are bundling multiple versions of the Data Grid.'].join('\n'));
  }
  return configuration;
};
exports.useGridConfiguration = useGridConfiguration;