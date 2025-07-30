import * as React from 'react';
import { MultiSectionDigitalClockSectionClasses } from "./multiSectionDigitalClockSectionClasses.js";
import type { MultiSectionDigitalClockOption, MultiSectionDigitalClockSlots, MultiSectionDigitalClockSlotProps } from "./MultiSectionDigitalClock.types.js";
import { FormProps } from "../internals/models/formProps.js";
import { PickerOwnerState } from "../models/pickers.js";
export interface ExportedMultiSectionDigitalClockSectionProps {
  className?: string;
  classes?: Partial<MultiSectionDigitalClockSectionClasses>;
  slots?: MultiSectionDigitalClockSlots;
  slotProps?: MultiSectionDigitalClockSlotProps;
}
export interface MultiSectionDigitalClockSectionProps<TSectionValue extends number | string> extends FormProps, ExportedMultiSectionDigitalClockSectionProps {
  autoFocus?: boolean;
  items: MultiSectionDigitalClockOption<TSectionValue>[];
  onChange: (value: TSectionValue) => void;
  active?: boolean;
  skipDisabled?: boolean;
  role?: string;
}
export interface MultiSectionDigitalClockSectionOwnerState extends PickerOwnerState {
  /**
   * `true` if this is not the initial render of the digital clock.
   */
  hasDigitalClockAlreadyBeenRendered: boolean;
}
type MultiSectionDigitalClockSectionComponent = <TSectionValue extends number | string>(props: MultiSectionDigitalClockSectionProps<TSectionValue> & React.RefAttributes<HTMLUListElement>) => React.JSX.Element & {
  propTypes?: any;
};
/**
 * @ignore - internal component.
 */
export declare const MultiSectionDigitalClockSection: MultiSectionDigitalClockSectionComponent;
export {};