import { FieldSection, MuiPickersAdapter, PickerValidDate } from "../../../models/index.js";
import { PickersLocaleText } from "../../../locales/index.js";
interface BuildSectionsFromFormatParameters {
  adapter: MuiPickersAdapter;
  format: string;
  formatDensity: 'dense' | 'spacious';
  isRtl: boolean;
  shouldRespectLeadingZeros: boolean;
  localeText: PickersLocaleText;
  localizedDigits: string[];
  date: PickerValidDate | null;
  enableAccessibleFieldDOMStructure: boolean;
}
export declare const buildSectionsFromFormat: (parameters: BuildSectionsFromFormatParameters) => FieldSection[];
export {};