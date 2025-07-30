import { RefObject } from '@mui/x-internals/types';
import { GridFilterItem, GridFilterModel } from "../../../models/index.js";
import type { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridAggregatedFilterItemApplier, GridFilterItemResult, GridQuickFilterValueResult } from "./gridFilterState.js";
/**
 * Adds default values to the optional fields of a filter items.
 * @param {GridFilterItem} item The raw filter item.
 * @param {RefObject<GridPrivateApiCommunity>} apiRef The API of the grid.
 * @return {GridFilterItem} The clean filter item with an uniq ID and an always-defined operator.
 * TODO: Make the typing reflect the different between GridFilterInputItem and GridFilterItem.
 */
export declare const cleanFilterItem: (item: GridFilterItem, apiRef: RefObject<GridPrivateApiCommunity>) => GridFilterItem;
export declare const sanitizeFilterModel: (model: GridFilterModel, disableMultipleColumnsFiltering: boolean, apiRef: RefObject<GridPrivateApiCommunity>) => GridFilterModel;
export declare const mergeStateWithFilterModel: (filterModel: GridFilterModel, disableMultipleColumnsFiltering: boolean, apiRef: RefObject<GridPrivateApiCommunity>) => (filteringState: GridStateCommunity["filter"]) => GridStateCommunity["filter"];
export declare const removeDiacritics: (value: unknown) => unknown;
export declare const shouldQuickFilterExcludeHiddenColumns: (filterModel: GridFilterModel) => boolean;
export declare const buildAggregatedFilterApplier: (filterModel: GridFilterModel, apiRef: RefObject<GridPrivateApiCommunity>, disableEval: boolean) => GridAggregatedFilterItemApplier;
type FilterCache = {
  cleanedFilterItems?: GridFilterItem[];
};
export declare const passFilterLogic: (allFilterItemResults: (null | GridFilterItemResult)[], allQuickFilterResults: (null | GridQuickFilterValueResult)[], filterModel: GridFilterModel, apiRef: RefObject<GridPrivateApiCommunity>, cache: FilterCache) => boolean;
export {};