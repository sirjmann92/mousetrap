import * as React from 'react';
import { DefaultizedProps } from '@mui/x-internals/types';
import { TimeClockSlots, TimeClockSlotProps } from "../TimeClock/TimeClock.types.js";
import { BasePickerInputProps } from "../internals/models/props/basePickerProps.js";
import { LocalizedComponent } from "../locales/utils/pickersLocaleTextApi.js";
import { TimePickerToolbarProps, ExportedTimePickerToolbarProps } from "./TimePickerToolbar.js";
import { TimeValidationError } from "../models/index.js";
import { PickerViewRendererLookup } from "../internals/hooks/usePicker/index.js";
import { TimeViewRendererProps } from "../timeViewRenderers/index.js";
import { BaseClockProps, ExportedBaseClockProps } from "../internals/models/props/time.js";
import { PickerValue, TimeViewWithMeridiem } from "../internals/models/index.js";
import { ValidateTimePropsToDefault } from "../validation/validateTime.js";
export interface BaseTimePickerSlots extends TimeClockSlots {
  /**
   * Custom component for the toolbar rendered above the views.
   * @default TimePickerToolbar
   */
  toolbar?: React.JSXElementConstructor<TimePickerToolbarProps>;
}
export interface BaseTimePickerSlotProps extends TimeClockSlotProps {
  toolbar?: ExportedTimePickerToolbarProps;
}
export type TimePickerViewRenderers<TView extends TimeViewWithMeridiem> = PickerViewRendererLookup<PickerValue, TView, TimeViewRendererProps<TView, BaseClockProps<TView>>>;
export interface BaseTimePickerProps<TView extends TimeViewWithMeridiem> extends BasePickerInputProps<PickerValue, TView, TimeValidationError>, ExportedBaseClockProps {
  /**
   * Display ampm controls under the clock (instead of in the toolbar).
   * @default true on desktop, false on mobile
   */
  ampmInClock?: boolean;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: BaseTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: BaseTimePickerSlotProps;
  /**
   * Define custom view renderers for each section.
   * If `null`, the section will only have field editing.
   * If `undefined`, internally defined view will be used.
   */
  viewRenderers?: Partial<TimePickerViewRenderers<TView>>;
}
type UseTimePickerDefaultizedProps<TView extends TimeViewWithMeridiem, Props extends BaseTimePickerProps<TView>> = LocalizedComponent<DefaultizedProps<Props, 'views' | 'openTo' | 'ampm' | ValidateTimePropsToDefault>>;
export declare function useTimePickerDefaultizedProps<TView extends TimeViewWithMeridiem, Props extends BaseTimePickerProps<TView>>(props: Props, name: string): UseTimePickerDefaultizedProps<TView, Props>;
export {};