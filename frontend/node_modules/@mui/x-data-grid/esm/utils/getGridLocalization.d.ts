import type { GridLocaleText } from "../models/api/gridLocaleTextApi.js";
export interface Localization {
  components: {
    MuiDataGrid: {
      defaultProps: {
        localeText: Partial<GridLocaleText>;
      };
    };
  };
}
export declare const getGridLocalization: (gridTranslations: Partial<GridLocaleText>) => Localization;