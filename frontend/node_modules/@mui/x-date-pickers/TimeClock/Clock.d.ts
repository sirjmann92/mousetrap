import * as React from 'react';
import type { PickerSelectionState } from "../internals/hooks/usePicker/index.js";
import { useMeridiemMode } from "../internals/hooks/date-helpers-hooks.js";
import { PickerOwnerState, PickerValidDate, TimeView } from "../models/index.js";
import { ClockClasses } from "./clockClasses.js";
import { Meridiem } from "../internals/utils/time-utils.js";
import { FormProps } from "../internals/models/formProps.js";
export interface ClockProps extends ReturnType<typeof useMeridiemMode>, FormProps {
  ampm: boolean;
  ampmInClock: boolean;
  autoFocus?: boolean;
  children: readonly React.ReactNode[];
  isTimeDisabled: (timeValue: number, type: TimeView) => boolean;
  minutesStep?: number;
  onChange: (value: number, isFinish?: PickerSelectionState) => void;
  /**
   * DOM id that the selected option should have
   * Should only be `undefined` on the server
   */
  selectedId: string | undefined;
  type: TimeView;
  /**
   * The numeric value of the current view.
   */
  viewValue: number;
  /**
   * The current full date value.
   */
  value: PickerValidDate | null;
  /**
   * Minimum and maximum value of the clock.
   */
  viewRange: [number, number];
  className?: string;
  classes?: Partial<ClockClasses>;
}
export interface ClockOwnerState extends PickerOwnerState {
  /**
   * `true` if the clock is disabled, `false` otherwise.
   */
  isClockDisabled: boolean;
  /**
   * The current meridiem mode of the clock.
   */
  clockMeridiemMode: Meridiem | null;
}
/**
 * @ignore - internal component.
 */
export declare function Clock(inProps: ClockProps): React.JSX.Element;