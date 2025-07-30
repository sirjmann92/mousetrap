import * as React from 'react';
interface ToolbarItemProps extends Pick<React.ComponentProps<'button'>, 'onKeyDown' | 'onFocus' | 'aria-disabled' | 'disabled'> {}
export declare function useRegisterToolbarButton(props: ToolbarItemProps, ref: React.RefObject<HTMLButtonElement | null>): {
  tabIndex: number;
  disabled: boolean | undefined;
  'aria-disabled': (boolean | "true" | "false") | undefined;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLButtonElement>) => void;
};
export {};