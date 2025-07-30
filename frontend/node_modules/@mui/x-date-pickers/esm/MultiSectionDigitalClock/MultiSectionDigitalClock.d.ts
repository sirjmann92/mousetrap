import * as React from 'react';
import { MultiSectionDigitalClockProps } from "./MultiSectionDigitalClock.types.js";
type MultiSectionDigitalClockComponent = ((props: MultiSectionDigitalClockProps & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [TimePicker](https://mui.com/x/react-date-pickers/time-picker/)
 * - [DigitalClock](https://mui.com/x/react-date-pickers/digital-clock/)
 *
 * API:
 *
 * - [MultiSectionDigitalClock API](https://mui.com/x/api/date-pickers/multi-section-digital-clock/)
 */
export declare const MultiSectionDigitalClock: MultiSectionDigitalClockComponent;
export {};