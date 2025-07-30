"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGridLocalization = void 0;
const getGridLocalization = gridTranslations => ({
  components: {
    MuiDataGrid: {
      defaultProps: {
        localeText: gridTranslations
      }
    }
  }
});
exports.getGridLocalization = getGridLocalization;