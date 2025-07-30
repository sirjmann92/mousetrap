import * as React from 'react';
import { AdapterFormats, MuiPickersAdapter, PickerValidDate } from "../models/index.js";
import { PickersInputLocaleText } from "../locales/index.js";
export interface PickersAdapterContextValue {
  defaultDates: {
    minDate: PickerValidDate;
    maxDate: PickerValidDate;
  };
  utils: MuiPickersAdapter;
  adapter: MuiPickersAdapter;
  localeText: PickersInputLocaleText | undefined;
}
export type PickerAdapterContextNullableValue = { [K in keyof PickersAdapterContextValue]: PickersAdapterContextValue[K] | null };
export declare const PickerAdapterContext: React.Context<PickerAdapterContextNullableValue | null>;
/**
 * The context that provides the date adapter and default dates to the pickers.
 * @deprecated Use `usePickersAdapter` hook if you need access to the adapter instead.
 */
export declare const MuiPickersAdapterContext: React.Context<PickerAdapterContextNullableValue | null>;
export interface LocalizationProviderProps<TLocale> {
  children?: React.ReactNode;
  /**
   * Date library adapter class function.
   * @see See the localization provider {@link https://mui.com/x/react-date-pickers/quickstart/#integrate-provider-and-adapter date adapter setup section} for more details.
   */
  dateAdapter?: new (...args: any) => MuiPickersAdapter<TLocale>;
  /** Formats that are used for any child pickers */
  dateFormats?: Partial<AdapterFormats>;
  /**
   * Date library instance you are using, if it has some global overrides
   * ```jsx
   * dateLibInstance={momentTimeZone}
   * ```
   */
  dateLibInstance?: any;
  /**
   * Locale for the date library you are using
   */
  adapterLocale?: TLocale;
  /**
   * Locale for components texts
   */
  localeText?: PickersInputLocaleText;
}
type LocalizationProviderComponent = (<TLocale>(props: LocalizationProviderProps<TLocale>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [Date format and localization](https://mui.com/x/react-date-pickers/adapters-locale/)
 * - [Calendar systems](https://mui.com/x/react-date-pickers/calendar-systems/)
 * - [Translated components](https://mui.com/x/react-date-pickers/localization/)
 * - [UTC and timezones](https://mui.com/x/react-date-pickers/timezone/)
 *
 * API:
 *
 * - [LocalizationProvider API](https://mui.com/x/api/date-pickers/localization-provider/)
 */
export declare const LocalizationProvider: LocalizationProviderComponent;
export {};