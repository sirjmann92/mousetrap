import { MakeOptional } from '@mui/x-internals/types';
import { UseDesktopPickerSlots, ExportedUseDesktopPickerSlotProps, DesktopOnlyPickerProps } from "../internals/hooks/useDesktopPicker/index.js";
import { BaseDateTimePickerProps, BaseDateTimePickerSlots, BaseDateTimePickerSlotProps } from "../DateTimePicker/shared.js";
import { DateOrTimeView } from "../models/index.js";
import { DigitalTimePickerProps } from "../internals/models/props/time.js";
import { ExportedYearCalendarProps } from "../YearCalendar/YearCalendar.types.js";
export interface DesktopDateTimePickerSlots extends BaseDateTimePickerSlots, MakeOptional<UseDesktopPickerSlots, 'field' | 'openPickerIcon'> {}
export interface DesktopDateTimePickerSlotProps<TEnableAccessibleFieldDOMStructure extends boolean> extends BaseDateTimePickerSlotProps, ExportedUseDesktopPickerSlotProps<TEnableAccessibleFieldDOMStructure> {}
export interface DesktopDateTimePickerProps<TEnableAccessibleFieldDOMStructure extends boolean = true> extends BaseDateTimePickerProps, DesktopOnlyPickerProps, DigitalTimePickerProps, ExportedYearCalendarProps {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: DesktopDateTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: DesktopDateTimePickerSlotProps<TEnableAccessibleFieldDOMStructure>;
  /**
   * Available views.
   */
  views?: readonly DateOrTimeView[];
  /**
   * Years rendered per row.
   * @default 4
   */
  yearsPerRow?: 3 | 4;
}