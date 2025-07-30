'use client';

import * as React from 'react';
export const ToolbarContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") ToolbarContext.displayName = "ToolbarContext";
export function useToolbarContext() {
  const context = React.useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('MUI X: Missing context. Toolbar subcomponents must be placed within a <Toolbar /> component.');
  }
  return context;
}