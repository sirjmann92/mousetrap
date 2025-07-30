import * as React from 'react';
export interface ToolbarContextValue {
  focusableItemId: string | null;
  registerItem: (id: string, ref: React.RefObject<HTMLButtonElement | null>) => void;
  unregisterItem: (id: string) => void;
  onItemKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onItemFocus: (id: string) => void;
  onItemDisabled: (id: string, disabled: boolean) => void;
}
export declare const ToolbarContext: React.Context<ToolbarContextValue | undefined>;
export declare function useToolbarContext(): ToolbarContextValue;