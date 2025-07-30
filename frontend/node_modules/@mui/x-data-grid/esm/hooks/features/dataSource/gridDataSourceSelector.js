import { gridFilterModelSelector } from "../filter/gridFilterSelector.js";
import { gridSortModelSelector } from "../sorting/gridSortingSelector.js";
import { gridPaginationModelSelector } from "../pagination/gridPaginationSelector.js";
import { createSelector } from "../../../utils/createSelector.js";
export const gridGetRowsParamsSelector = createSelector(gridFilterModelSelector, gridSortModelSelector, gridPaginationModelSelector, (filterModel, sortModel, paginationModel) => ({
  groupKeys: [],
  paginationModel,
  sortModel,
  filterModel,
  start: paginationModel.page * paginationModel.pageSize,
  end: paginationModel.page * paginationModel.pageSize + paginationModel.pageSize - 1
}));