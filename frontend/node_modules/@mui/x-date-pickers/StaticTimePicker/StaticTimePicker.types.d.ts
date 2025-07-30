import { MakeOptional } from '@mui/x-internals/types';
import { BaseTimePickerProps, BaseTimePickerSlots, BaseTimePickerSlotProps } from "../TimePicker/shared.js";
import { StaticOnlyPickerProps, UseStaticPickerSlots, UseStaticPickerSlotProps } from "../internals/hooks/useStaticPicker/index.js";
import { TimeView } from "../models/index.js";
export interface StaticTimePickerSlots extends BaseTimePickerSlots, UseStaticPickerSlots {}
export interface StaticTimePickerSlotProps extends BaseTimePickerSlotProps, UseStaticPickerSlotProps {}
export interface StaticTimePickerProps extends BaseTimePickerProps<TimeView>, MakeOptional<StaticOnlyPickerProps, 'displayStaticWrapperAs'> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: StaticTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: StaticTimePickerSlotProps;
}