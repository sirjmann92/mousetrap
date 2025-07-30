import * as React from 'react';
import { ClockNumberClasses } from "./clockNumberClasses.js";
import { PickerOwnerState } from "../models/pickers.js";
export interface ClockNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  'aria-label': string;
  disabled: boolean;
  /**
   * Make sure callers pass an id which. It should be defined if selected.
   */
  id: string | undefined;
  index: number;
  inner: boolean;
  label: string;
  selected: boolean;
  classes?: Partial<ClockNumberClasses>;
}
export interface ClockNumberOwnerState extends PickerOwnerState {
  /**
   * `true` if the clock number is in the inner clock ring.
   * When used with meridiem, all the hours are in the outer ring.
   * When used without meridiem, the hours from 1 to 12 are in the outer ring and the hours from 13 to 24 are in the inner ring.
   * The minutes are always in the outer ring.
   */
  isClockNumberInInnerRing: boolean;
  /**
   * `true` if the clock number is selected.
   */
  isClockNumberSelected: boolean;
  /**
   * `true` if the clock number is disabled.
   */
  isClockNumberDisabled: boolean;
}
/**
 * @ignore - internal component.
 */
export declare function ClockNumber(inProps: ClockNumberProps): React.JSX.Element;