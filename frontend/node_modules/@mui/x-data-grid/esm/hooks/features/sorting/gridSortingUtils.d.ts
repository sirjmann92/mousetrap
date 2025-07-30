import { RefObject } from '@mui/x-internals/types';
import { GridSortingModelApplier } from "./gridSortingState.js";
import { GridApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridComparatorFn, GridSortDirection, GridSortModel } from "../../../models/gridSortModel.js";
export declare const sanitizeSortModel: (model: GridSortModel, disableMultipleColumnsSorting: boolean) => GridSortModel;
export declare const mergeStateWithSortModel: (sortModel: GridSortModel, disableMultipleColumnsSorting: boolean) => (state: GridStateCommunity) => GridStateCommunity;
/**
 * Generates a method to easily sort a list of rows according to the current sort model.
 * @param {GridSortModel} sortModel The model with which we want to sort the rows.
 * @param {RefObject<GridApiCommunity>} apiRef The API of the grid.
 * @returns {GridSortingModelApplier | null} A method that generates a list of sorted row ids from a list of rows according to the current sort model. If `null`, we consider that the rows should remain in the order there were provided.
 */
export declare const buildAggregatedSortingApplier: (sortModel: GridSortModel, apiRef: RefObject<GridApiCommunity>) => GridSortingModelApplier | null;
export declare const getNextGridSortDirection: (sortingOrder: readonly GridSortDirection[], current?: GridSortDirection) => GridSortDirection;
export declare const gridStringOrNumberComparator: GridComparatorFn;
export declare const gridNumberComparator: GridComparatorFn;
export declare const gridDateComparator: GridComparatorFn;