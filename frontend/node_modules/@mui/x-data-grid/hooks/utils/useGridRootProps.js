"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridRootProps = void 0;
var React = _interopRequireWildcard(require("react"));
var _GridRootPropsContext = require("../../context/GridRootPropsContext");
const useGridRootProps = () => {
  const contextValue = React.useContext(_GridRootPropsContext.GridRootPropsContext);
  if (!contextValue) {
    throw new Error('MUI X: useGridRootProps should only be used inside the DataGrid, DataGridPro or DataGridPremium component.');
  }
  return contextValue;
};
exports.useGridRootProps = useGridRootProps;