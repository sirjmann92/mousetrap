import * as React from 'react';
export interface GridPanelContextValue {
  columnsPanelTriggerRef: React.RefObject<HTMLButtonElement | null>;
  filterPanelTriggerRef: React.RefObject<HTMLButtonElement | null>;
  aiAssistantPanelTriggerRef: React.RefObject<HTMLButtonElement | null>;
}
export declare const GridPanelContext: React.Context<GridPanelContextValue | undefined>;
export declare function useGridPanelContext(): GridPanelContextValue;
export declare function GridPanelContextProvider({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element;