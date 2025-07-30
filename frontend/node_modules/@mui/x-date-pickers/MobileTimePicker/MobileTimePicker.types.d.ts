import { MakeOptional } from '@mui/x-internals/types';
import { UseMobilePickerSlots, ExportedUseMobilePickerSlotProps, MobileOnlyPickerProps } from "../internals/hooks/useMobilePicker/index.js";
import { BaseTimePickerProps, BaseTimePickerSlots, BaseTimePickerSlotProps } from "../TimePicker/shared.js";
import { TimeView } from "../models/index.js";
import { TimeViewWithMeridiem } from "../internals/models/index.js";
export interface MobileTimePickerSlots extends BaseTimePickerSlots, MakeOptional<UseMobilePickerSlots, 'field'> {}
export interface MobileTimePickerSlotProps<TEnableAccessibleFieldDOMStructure extends boolean> extends BaseTimePickerSlotProps, ExportedUseMobilePickerSlotProps<TEnableAccessibleFieldDOMStructure> {}
export interface MobileTimePickerProps<TView extends TimeViewWithMeridiem = TimeView, TEnableAccessibleFieldDOMStructure extends boolean = true> extends BaseTimePickerProps<TView>, MobileOnlyPickerProps {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: MobileTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: MobileTimePickerSlotProps<TEnableAccessibleFieldDOMStructure>;
}