import * as React from 'react';
import { GridRootPropsContext } from "../../context/GridRootPropsContext.js";
export const useGridRootProps = () => {
  const contextValue = React.useContext(GridRootPropsContext);
  if (!contextValue) {
    throw new Error('MUI X: useGridRootProps should only be used inside the DataGrid, DataGridPro or DataGridPremium component.');
  }
  return contextValue;
};