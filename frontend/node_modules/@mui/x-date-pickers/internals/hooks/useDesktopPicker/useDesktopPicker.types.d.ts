import * as React from 'react';
import { MakeRequired, SlotComponentPropsFromProps } from '@mui/x-internals/types';
import { BasePickerProps } from "../../models/props/basePickerProps.js";
import { PickerPopperSlots, PickerPopperSlotProps } from "../../components/PickerPopper/PickerPopper.js";
import { UsePickerParameters, UsePickerNonStaticProps, UsePickerProps } from "../usePicker/index.js";
import { PickerFieldSlotProps, PickerOwnerState } from "../../../models/index.js";
import { ExportedPickersLayoutSlots, ExportedPickersLayoutSlotProps, PickersLayoutSlotProps } from "../../../PickersLayout/PickersLayout.types.js";
import { DateOrTimeViewWithMeridiem, PickerValue } from "../../models/index.js";
import { PickerFieldUISlotsFromContext, PickerFieldUISlotPropsFromContext } from "../../components/PickerFieldUI.js";
import { PickerStep } from "../../utils/createNonRangePickerStepNavigation.js";
export interface UseDesktopPickerSlots extends Pick<PickerPopperSlots, 'desktopPaper' | 'desktopTransition' | 'desktopTrapFocus' | 'popper'>, ExportedPickersLayoutSlots<PickerValue>, PickerFieldUISlotsFromContext {
  /**
   * Component used to enter the date with the keyboard.
   */
  field: React.ElementType;
}
export interface ExportedUseDesktopPickerSlotProps<TEnableAccessibleFieldDOMStructure extends boolean> extends PickerPopperSlotProps, ExportedPickersLayoutSlotProps<PickerValue>, PickerFieldUISlotPropsFromContext {
  field?: SlotComponentPropsFromProps<PickerFieldSlotProps<PickerValue, TEnableAccessibleFieldDOMStructure>, {}, PickerOwnerState>;
}
export interface UseDesktopPickerSlotProps<TEnableAccessibleFieldDOMStructure extends boolean> extends ExportedUseDesktopPickerSlotProps<TEnableAccessibleFieldDOMStructure>, Pick<PickersLayoutSlotProps<PickerValue>, 'toolbar'> {}
export interface DesktopOnlyPickerProps extends UsePickerNonStaticProps {
  /**
   * If `true`, the `input` element is focused during the first mount.
   * @default false
   */
  autoFocus?: boolean;
}
export interface UseDesktopPickerProps<TView extends DateOrTimeViewWithMeridiem, TEnableAccessibleFieldDOMStructure extends boolean, TError, TExternalProps extends UsePickerProps<PickerValue, TView, TError, any>> extends BasePickerProps<PickerValue, any, TError, TExternalProps>, MakeRequired<DesktopOnlyPickerProps, 'format'> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: UseDesktopPickerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: UseDesktopPickerSlotProps<TEnableAccessibleFieldDOMStructure>;
}
export interface UseDesktopPickerParams<TView extends DateOrTimeViewWithMeridiem, TEnableAccessibleFieldDOMStructure extends boolean, TExternalProps extends UseDesktopPickerProps<TView, TEnableAccessibleFieldDOMStructure, any, TExternalProps>> extends Pick<UsePickerParameters<PickerValue, TView, TExternalProps>, 'valueManager' | 'valueType' | 'validator' | 'rendererInterceptor' | 'ref'> {
  props: TExternalProps;
  /**
   * Steps available for the picker.
   * This will be used to define the behavior of navigation actions.
   * If null, the picker will not have any step navigation.
   */
  steps: PickerStep[] | null;
}