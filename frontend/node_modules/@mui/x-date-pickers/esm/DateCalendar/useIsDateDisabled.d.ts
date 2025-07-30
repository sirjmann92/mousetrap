import { DefaultizedProps } from '@mui/x-internals/types';
import { ValidateDateProps } from "../validation/index.js";
import { PickerValidDate, TimezoneProps } from "../models/index.js";
export declare const useIsDateDisabled: ({
  shouldDisableDate,
  shouldDisableMonth,
  shouldDisableYear,
  minDate,
  maxDate,
  disableFuture,
  disablePast,
  timezone
}: ValidateDateProps & DefaultizedProps<TimezoneProps, "timezone">) => (day: PickerValidDate | null) => boolean;