import { PickersAdapterContextValue } from "../LocalizationProvider/LocalizationProvider.js";
import { PickersLocaleText } from "../locales/utils/pickersLocaleTextApi.js";
export declare const useLocalizationContext: () => UseLocalizationContextReturnValue;
export interface UseLocalizationContextReturnValue extends Omit<PickersAdapterContextValue, 'localeText'> {
  localeText: PickersLocaleText;
}
export declare const usePickerAdapter: () => import("@mui/x-date-pickers/models").MuiPickersAdapter<any>;