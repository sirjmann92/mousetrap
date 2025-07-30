import * as React from 'react';
import { PickerOwnerState, TimeView } from "../models/index.js";
import { ClockPointerClasses } from "./clockPointerClasses.js";
export interface ClockPointerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * `true` if the pointer is between two clock values.
   * On the `hours` view, it is always false.
   * On the `minutes` view, it is true if the pointer is on a value that is not a multiple of 5.
   */
  isBetweenTwoClockValues: boolean;
  isInner: boolean;
  type: TimeView;
  viewValue: number;
  classes?: Partial<ClockPointerClasses>;
}
export interface ClockPointerOwnerState extends PickerOwnerState {
  /**
   * `true` if the clock pointer should animate.
   */
  isClockPointerAnimated: boolean;
  /**
   * `true` if the pointer is between two clock values.
   * On the `hours` view, it is always false.
   * On the `minutes` view, it is true if the pointer is on a value that is not a multiple of 5.
   */
  isClockPointerBetweenTwoValues: boolean;
}
/**
 * @ignore - internal component.
 */
export declare function ClockPointer(inProps: ClockPointerProps): React.JSX.Element;