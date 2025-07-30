import { MakeOptional } from '@mui/x-internals/types';
import { UseMobilePickerSlots, ExportedUseMobilePickerSlotProps, MobileOnlyPickerProps } from "../internals/hooks/useMobilePicker/index.js";
import { BaseDateTimePickerProps, BaseDateTimePickerSlots, BaseDateTimePickerSlotProps } from "../DateTimePicker/shared.js";
export interface MobileDateTimePickerSlots extends BaseDateTimePickerSlots, MakeOptional<UseMobilePickerSlots, 'field'> {}
export interface MobileDateTimePickerSlotProps<TEnableAccessibleFieldDOMStructure extends boolean> extends BaseDateTimePickerSlotProps, ExportedUseMobilePickerSlotProps<TEnableAccessibleFieldDOMStructure> {}
export interface MobileDateTimePickerProps<TEnableAccessibleFieldDOMStructure extends boolean = true> extends BaseDateTimePickerProps, MobileOnlyPickerProps {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: MobileDateTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: MobileDateTimePickerSlotProps<TEnableAccessibleFieldDOMStructure>;
}