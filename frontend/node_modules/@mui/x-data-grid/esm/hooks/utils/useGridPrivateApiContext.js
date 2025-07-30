'use client';

import * as React from 'react';
export const GridPrivateApiContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") GridPrivateApiContext.displayName = "GridPrivateApiContext";
export function useGridPrivateApiContext() {
  const privateApiRef = React.useContext(GridPrivateApiContext);
  if (privateApiRef === undefined) {
    throw new Error(['MUI X: Could not find the Data Grid private context.', 'It looks like you rendered your component outside of a DataGrid, DataGridPro or DataGridPremium parent component.', 'This can also happen if you are bundling multiple versions of the Data Grid.'].join('\n'));
  }
  return privateApiRef;
}