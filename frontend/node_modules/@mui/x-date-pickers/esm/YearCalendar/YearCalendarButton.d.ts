import * as React from 'react';
import { YearCalendarSlotProps, YearCalendarSlots } from "./YearCalendar.types.js";
import { YearCalendarClasses } from "./yearCalendarClasses.js";
export interface YearCalendarButtonProps {
  value: number;
  tabIndex: number;
  selected: boolean;
  disabled: boolean;
  autoFocus: boolean;
  classes: Partial<YearCalendarClasses> | undefined;
  slots: YearCalendarSlots | undefined;
  slotProps: YearCalendarSlotProps | undefined;
  'aria-current': React.AriaAttributes['aria-current'];
  children: React.ReactNode;
  onClick: (event: React.MouseEvent, year: number) => void;
  onKeyDown: (event: React.KeyboardEvent, year: number) => void;
  onFocus: (event: React.FocusEvent, year: number) => void;
  onBlur: (event: React.FocusEvent, year: number) => void;
}
/**
 * @ignore - internal component.
 */
export declare const YearCalendarButton: React.NamedExoticComponent<YearCalendarButtonProps>;