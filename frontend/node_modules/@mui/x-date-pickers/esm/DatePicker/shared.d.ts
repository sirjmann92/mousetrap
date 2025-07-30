import * as React from 'react';
import { DefaultizedProps } from '@mui/x-internals/types';
import { DateCalendarSlots, DateCalendarSlotProps, ExportedDateCalendarProps } from "../DateCalendar/DateCalendar.types.js";
import { DateValidationError, DateView } from "../models/index.js";
import { BasePickerInputProps } from "../internals/models/props/basePickerProps.js";
import { LocalizedComponent } from "../locales/utils/pickersLocaleTextApi.js";
import { DatePickerToolbarProps, ExportedDatePickerToolbarProps } from "./DatePickerToolbar.js";
import { PickerViewRendererLookup } from "../internals/hooks/usePicker/index.js";
import { DateViewRendererProps } from "../dateViewRenderers/index.js";
import { PickerValue } from "../internals/models/index.js";
import { ValidateDatePropsToDefault } from "../validation/validateDate.js";
export interface BaseDatePickerSlots extends DateCalendarSlots {
  /**
   * Custom component for the toolbar rendered above the views.
   * @default DatePickerToolbar
   */
  toolbar?: React.JSXElementConstructor<DatePickerToolbarProps>;
}
export interface BaseDatePickerSlotProps extends DateCalendarSlotProps {
  toolbar?: ExportedDatePickerToolbarProps;
}
export type DatePickerViewRenderers<TView extends DateView> = PickerViewRendererLookup<PickerValue, TView, DateViewRendererProps<TView>>;
export interface BaseDatePickerProps extends BasePickerInputProps<PickerValue, DateView, DateValidationError>, ExportedDateCalendarProps {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: BaseDatePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: BaseDatePickerSlotProps;
  /**
   * Define custom view renderers for each section.
   * If `null`, the section will only have field editing.
   * If `undefined`, internally defined view will be used.
   */
  viewRenderers?: Partial<DatePickerViewRenderers<DateView>>;
}
type UseDatePickerDefaultizedProps<Props extends BaseDatePickerProps> = LocalizedComponent<DefaultizedProps<Props, 'views' | 'openTo' | ValidateDatePropsToDefault>>;
export declare function useDatePickerDefaultizedProps<Props extends BaseDatePickerProps>(props: Props, name: string): UseDatePickerDefaultizedProps<Props>;
export {};