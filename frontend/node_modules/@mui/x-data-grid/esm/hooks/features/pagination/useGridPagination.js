import _extends from "@babel/runtime/helpers/esm/extends";
import { throwIfPageSizeExceedsTheLimit, getDefaultGridPaginationModel } from "./gridPaginationUtils.js";
import { useGridPaginationModel } from "./useGridPaginationModel.js";
import { useGridRowCount } from "./useGridRowCount.js";
import { useGridPaginationMeta } from "./useGridPaginationMeta.js";
export const paginationStateInitializer = (state, props) => {
  const paginationModel = _extends({}, getDefaultGridPaginationModel(props.autoPageSize), props.paginationModel ?? props.initialState?.pagination?.paginationModel);
  throwIfPageSizeExceedsTheLimit(paginationModel.pageSize, props.signature);
  const rowCount = props.rowCount ?? props.initialState?.pagination?.rowCount ?? (props.paginationMode === 'client' ? state.rows?.totalRowCount : undefined);
  const meta = props.paginationMeta ?? props.initialState?.pagination?.meta ?? {};
  return _extends({}, state, {
    pagination: _extends({}, state.pagination, {
      paginationModel,
      rowCount,
      meta,
      enabled: props.pagination === true,
      paginationMode: props.paginationMode
    })
  });
};

/**
 * @requires useGridFilter (state)
 * @requires useGridDimensions (event) - can be after
 */
export const useGridPagination = (apiRef, props) => {
  useGridPaginationMeta(apiRef, props);
  useGridPaginationModel(apiRef, props);
  useGridRowCount(apiRef, props);
};