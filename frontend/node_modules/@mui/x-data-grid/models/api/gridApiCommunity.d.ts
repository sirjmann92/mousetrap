import type { GridDataSourceApi } from "../../hooks/features/dataSource/models.js";
import type { GridInitialStateCommunity, GridStateCommunity } from "../gridStateCommunity.js";
import type { DataGridProcessedProps } from "../props/DataGridProps.js";
import type { GridApiCommon, GridPrivateOnlyApiCommon } from "./gridApiCommon.js";
import type { GridColumnReorderApi } from "./gridColumnApi.js";
import type { GridRowProApi } from "./gridRowApi.js";
import type { GridRowMultiSelectionApi } from "./gridRowSelectionApi.js";
/**
 * The API of the community version of the Data Grid.
 */
export interface GridApiCommunity extends GridApiCommon<GridStateCommunity, GridInitialStateCommunity>, GridDataSourceApi {}
export interface GridPrivateApiCommunity extends GridApiCommunity, GridPrivateOnlyApiCommon<GridApiCommunity, GridPrivateApiCommunity, DataGridProcessedProps>, GridRowMultiSelectionApi, GridColumnReorderApi, GridRowProApi {}