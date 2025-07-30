import * as React from 'react';
import { ListProps } from '@mui/material/List';
import { PickerValidValue } from "../internals/models/index.js";
import { PickerChangeImportance } from "../models/pickers.js";
interface PickersShortcutsItemGetValueParams<TValue extends PickerValidValue> {
  isValid: (value: TValue) => boolean;
}
export interface PickersShortcutsItem<TValue extends PickerValidValue> {
  label: string;
  getValue: (params: PickersShortcutsItemGetValueParams<TValue>) => TValue;
  /**
   * Identifier of the shortcut.
   * If provided, it will be used as the key of the shortcut.
   */
  id?: string;
}
export type PickersShortcutsItemContext = Omit<PickersShortcutsItem<PickerValidValue>, 'getValue'>;
export interface ExportedPickersShortcutProps<TValue extends PickerValidValue> extends Omit<ListProps, 'onChange'> {
  /**
   * Ordered array of shortcuts to display.
   * If empty, does not display the shortcuts.
   * @default []
   */
  items?: PickersShortcutsItem<TValue>[];
  /**
   * Importance of the change when picking a shortcut:
   * - "accept": fires `onChange`, fires `onAccept` and closes the Picker.
   * - "set": fires `onChange` but do not fire `onAccept` and does not close the Picker.
   * @default "accept"
   */
  changeImportance?: PickerChangeImportance;
}
export interface PickersShortcutsProps<TValue extends PickerValidValue> extends ExportedPickersShortcutProps<TValue> {}
/**
 * Demos:
 *
 * - [Shortcuts](https://mui.com/x/react-date-pickers/shortcuts/)
 *
 * API:
 *
 * - [PickersShortcuts API](https://mui.com/x/api/date-pickers/pickers-shortcuts/)
 */
declare function PickersShortcuts<TValue extends PickerValidValue>(props: PickersShortcutsProps<TValue>): React.JSX.Element | null;
declare namespace PickersShortcuts {
  var propTypes: any;
}
export { PickersShortcuts };