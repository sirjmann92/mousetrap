import * as React from 'react';
import { DefaultizedProps } from '@mui/x-internals/types';
import { DateOrTimeView, DateTimeValidationError } from "../models/index.js";
import { DateCalendarSlots, DateCalendarSlotProps, ExportedDateCalendarProps } from "../DateCalendar/DateCalendar.types.js";
import { BasePickerInputProps } from "../internals/models/props/basePickerProps.js";
import { DateTimePickerTabsProps } from "./DateTimePickerTabs.js";
import { LocalizedComponent } from "../locales/utils/pickersLocaleTextApi.js";
import { DateTimePickerToolbarProps, ExportedDateTimePickerToolbarProps } from "./DateTimePickerToolbar.js";
import { PickerViewRendererLookup } from "../internals/hooks/usePicker/index.js";
import { DateViewRendererProps } from "../dateViewRenderers/index.js";
import { TimeViewRendererProps } from "../timeViewRenderers/index.js";
import { BaseClockProps, DigitalTimePickerProps } from "../internals/models/props/time.js";
import { DateOrTimeViewWithMeridiem, PickerValue, TimeViewWithMeridiem } from "../internals/models/index.js";
import { ExportedValidateDateTimeProps, ValidateDateTimePropsToDefault } from "../validation/validateDateTime.js";
import { DigitalClockSlotProps, DigitalClockSlots } from "../DigitalClock/index.js";
import { MultiSectionDigitalClockSlotProps, MultiSectionDigitalClockSlots } from "../MultiSectionDigitalClock/index.js";
export interface BaseDateTimePickerSlots extends DateCalendarSlots, DigitalClockSlots, MultiSectionDigitalClockSlots {
  /**
   * Tabs enabling toggling between date and time pickers.
   * @default DateTimePickerTabs
   */
  tabs?: React.ElementType<DateTimePickerTabsProps>;
  /**
   * Custom component for the toolbar rendered above the views.
   * @default DateTimePickerToolbar
   */
  toolbar?: React.JSXElementConstructor<DateTimePickerToolbarProps>;
}
export interface BaseDateTimePickerSlotProps extends DateCalendarSlotProps, DigitalClockSlotProps, MultiSectionDigitalClockSlotProps {
  /**
   * Props passed down to the tabs component.
   */
  tabs?: DateTimePickerTabsProps;
  /**
   * Props passed down to the toolbar component.
   */
  toolbar?: ExportedDateTimePickerToolbarProps;
}
export type DateTimePickerViewRenderers<TView extends DateOrTimeViewWithMeridiem> = PickerViewRendererLookup<PickerValue, TView, Omit<DateViewRendererProps<TView>, 'slots' | 'slotProps'> & Omit<TimeViewRendererProps<TimeViewWithMeridiem, BaseClockProps<TimeViewWithMeridiem>>, 'slots' | 'slotProps'>>;
export interface BaseDateTimePickerProps extends Omit<BasePickerInputProps<PickerValue, DateOrTimeViewWithMeridiem, DateTimeValidationError>, 'views'>, Omit<ExportedDateCalendarProps, 'onViewChange' | 'views'>, DigitalTimePickerProps, ExportedValidateDateTimeProps {
  /**
   * Display ampm controls under the clock (instead of in the toolbar).
   * @default true on desktop, false on mobile
   */
  ampmInClock?: boolean;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: BaseDateTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: BaseDateTimePickerSlotProps;
  /**
   * Define custom view renderers for each section.
   * If `null`, the section will only have field editing.
   * If `undefined`, internally defined view will be used.
   */
  viewRenderers?: Partial<DateTimePickerViewRenderers<DateOrTimeViewWithMeridiem>>;
  /**
   * Available views.
   */
  views?: readonly DateOrTimeView[];
}
type UseDateTimePickerDefaultizedProps<Props extends BaseDateTimePickerProps> = LocalizedComponent<Omit<DefaultizedProps<Props, 'openTo' | 'orientation' | 'ampm' | ValidateDateTimePropsToDefault>, 'views'>> & {
  shouldRenderTimeInASingleColumn: boolean;
  views: readonly DateOrTimeViewWithMeridiem[];
};
export declare function useDateTimePickerDefaultizedProps<Props extends BaseDateTimePickerProps>(props: Props, name: string): UseDateTimePickerDefaultizedProps<Props>;
export {};