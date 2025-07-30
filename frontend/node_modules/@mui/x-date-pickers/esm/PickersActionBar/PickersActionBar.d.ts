import * as React from 'react';
import { DialogActionsProps } from '@mui/material/DialogActions';
export type PickersActionBarAction = 'clear' | 'cancel' | 'accept' | 'today' | 'next' | 'nextOrAccept';
export interface PickersActionBarProps extends DialogActionsProps {
  /**
   * Ordered array of actions to display.
   * If empty, does not display that action bar.
   * @default
   * - `[]` for Pickers with one selection step which `closeOnSelect`.
   * - `['cancel', 'nextOrAccept']` for all other Pickers.
   */
  actions?: PickersActionBarAction[];
}
/**
 * Demos:
 *
 * - [Custom slots and subcomponents](https://mui.com/x/react-date-pickers/custom-components/)
 * - [Custom layout](https://mui.com/x/react-date-pickers/custom-layout/)
 *
 * API:
 *
 * - [PickersActionBar API](https://mui.com/x/api/date-pickers/pickers-action-bar/)
 */
declare function PickersActionBarComponent(props: PickersActionBarProps): React.JSX.Element | null;
declare namespace PickersActionBarComponent {
  var propTypes: any;
}
declare const PickersActionBar: React.MemoExoticComponent<typeof PickersActionBarComponent>;
export { PickersActionBar };