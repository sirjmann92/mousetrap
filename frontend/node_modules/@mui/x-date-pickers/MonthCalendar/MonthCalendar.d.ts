import * as React from 'react';
import { DefaultizedProps } from '@mui/x-internals/types';
import { MonthCalendarProps } from "./MonthCalendar.types.js";
export declare function useMonthCalendarDefaultizedProps(props: MonthCalendarProps, name: string): DefaultizedProps<MonthCalendarProps, 'minDate' | 'maxDate' | 'disableFuture' | 'disablePast' | 'monthsPerRow'>;
type MonthCalendarComponent = ((props: MonthCalendarProps & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [DateCalendar](https://mui.com/x/react-date-pickers/date-calendar/)
 *
 * API:
 *
 * - [MonthCalendar API](https://mui.com/x/api/date-pickers/month-calendar/)
 */
export declare const MonthCalendar: MonthCalendarComponent;
export {};