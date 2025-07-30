import * as React from 'react';
import { MuiPickersAdapter, PickerValidDate } from "../models/index.js";
import type { PickerSelectionState } from "../internals/hooks/usePicker/index.js";
interface GetHourNumbersOptions {
  ampm: boolean;
  value: PickerValidDate | null;
  getClockNumberText: (hour: string) => string;
  isDisabled: (value: number) => boolean;
  onChange: (value: number, isFinish?: PickerSelectionState) => void;
  /**
   * DOM id that the selected option should have
   * Should only be `undefined` on the server
   */
  selectedId: string | undefined;
  adapter: MuiPickersAdapter;
}
/**
 * @ignore - internal component.
 */
export declare const getHourNumbers: ({
  ampm,
  value,
  getClockNumberText,
  isDisabled,
  selectedId,
  adapter
}: GetHourNumbersOptions) => React.JSX.Element[];
export declare const getMinutesNumbers: ({
  adapter,
  value,
  isDisabled,
  getClockNumberText,
  selectedId
}: Omit<GetHourNumbersOptions, "ampm" | "value"> & {
  value: number;
}) => React.JSX.Element[];
export {};