import * as React from 'react';
import { MonthCalendarSlotProps, MonthCalendarSlots } from "./MonthCalendar.types.js";
import { MonthCalendarClasses } from "./monthCalendarClasses.js";
export interface MonthCalendarButtonProps {
  value: number;
  tabIndex: number;
  selected: boolean;
  disabled: boolean;
  autoFocus: boolean;
  classes: Partial<MonthCalendarClasses> | undefined;
  slots: MonthCalendarSlots | undefined;
  slotProps: MonthCalendarSlotProps | undefined;
  'aria-current': React.AriaAttributes['aria-current'];
  'aria-label': React.AriaAttributes['aria-label'];
  children: React.ReactNode;
  onClick: (event: React.MouseEvent, month: number) => void;
  onKeyDown: (event: React.KeyboardEvent, month: number) => void;
  onFocus: (event: React.FocusEvent, month: number) => void;
  onBlur: (event: React.FocusEvent, month: number) => void;
}
/**
 * @ignore - do not document.
 */
export declare const MonthCalendarButton: React.NamedExoticComponent<MonthCalendarButtonProps>;