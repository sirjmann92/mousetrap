export const getGridLocalization = gridTranslations => ({
  components: {
    MuiDataGrid: {
      defaultProps: {
        localeText: gridTranslations
      }
    }
  }
});