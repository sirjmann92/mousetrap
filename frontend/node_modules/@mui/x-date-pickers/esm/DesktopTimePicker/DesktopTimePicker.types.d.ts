import { MakeOptional } from '@mui/x-internals/types';
import { UseDesktopPickerSlots, ExportedUseDesktopPickerSlotProps, DesktopOnlyPickerProps } from "../internals/hooks/useDesktopPicker/index.js";
import { BaseTimePickerProps, BaseTimePickerSlots, BaseTimePickerSlotProps } from "../TimePicker/shared.js";
import { TimeViewWithMeridiem } from "../internals/models/index.js";
import { DigitalTimePickerProps } from "../internals/models/props/time.js";
import { DigitalClockSlots, DigitalClockSlotProps } from "../DigitalClock/index.js";
import { MultiSectionDigitalClockSlots, MultiSectionDigitalClockSlotProps } from "../MultiSectionDigitalClock/index.js";
import { TimeView } from "../models/index.js";
export interface DesktopTimePickerSlots extends BaseTimePickerSlots, MakeOptional<UseDesktopPickerSlots, 'field' | 'openPickerIcon'>, DigitalClockSlots, MultiSectionDigitalClockSlots {}
export interface DesktopTimePickerSlotProps<TEnableAccessibleFieldDOMStructure extends boolean> extends BaseTimePickerSlotProps, ExportedUseDesktopPickerSlotProps<TEnableAccessibleFieldDOMStructure>, DigitalClockSlotProps, MultiSectionDigitalClockSlotProps {}
export interface DesktopTimePickerProps<TEnableAccessibleFieldDOMStructure extends boolean = true> extends BaseTimePickerProps<TimeViewWithMeridiem>, DesktopOnlyPickerProps, DigitalTimePickerProps {
  /**
   * Available views.
   */
  views?: readonly TimeView[];
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: DesktopTimePickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: DesktopTimePickerSlotProps<TEnableAccessibleFieldDOMStructure>;
}