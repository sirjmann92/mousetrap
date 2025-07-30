'use client';

import * as React from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export const GridPanelContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") GridPanelContext.displayName = "GridPanelContext";
export function useGridPanelContext() {
  const context = React.useContext(GridPanelContext);
  if (context === undefined) {
    throw new Error('MUI X: Missing context.');
  }
  return context;
}
export function GridPanelContextProvider({
  children
}) {
  const columnsPanelTriggerRef = React.useRef(null);
  const filterPanelTriggerRef = React.useRef(null);
  const aiAssistantPanelTriggerRef = React.useRef(null);
  const value = React.useMemo(() => ({
    columnsPanelTriggerRef,
    filterPanelTriggerRef,
    aiAssistantPanelTriggerRef
  }), []);
  return /*#__PURE__*/_jsx(GridPanelContext.Provider, {
    value: value,
    children: children
  });
}