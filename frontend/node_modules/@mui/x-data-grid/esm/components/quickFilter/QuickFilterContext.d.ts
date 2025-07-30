import * as React from 'react';
export interface QuickFilterState {
  value: string;
  expanded: boolean;
}
export interface QuickFilterContextValue {
  state: QuickFilterState;
  controlId: string | undefined;
  controlRef: React.RefObject<HTMLInputElement | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  clearValue: () => void;
  onValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExpandedChange: (expanded: boolean) => void;
}
export declare const QuickFilterContext: React.Context<QuickFilterContextValue | undefined>;
export declare function useQuickFilterContext(): QuickFilterContextValue;