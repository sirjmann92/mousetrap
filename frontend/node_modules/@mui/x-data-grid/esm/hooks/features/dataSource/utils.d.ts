import type { GridGetRowsParams, GridGetRowsResponse } from "../../../models/gridDataSource.js";
export declare enum DataSourceRowsUpdateStrategy {
  Default = "set-new-rows",
  LazyLoading = "replace-row-range",
}
/**
 * Provides better cache hit rate by:
 * 1. Splitting the data into smaller chunks to be stored in the cache (cache `set`)
 * 2. Merging multiple cache entries into a single response to get the required chunk (cache `get`)
 */
export declare class CacheChunkManager {
  private chunkSize;
  /**
   * @param chunkSize The number of rows to store in each cache entry.
   * If not set, the whole array will be stored in a single cache entry.
   * Setting this value to smallest page size will result in better cache hit rate.
   * Has no effect if cursor pagination is used.
   */
  constructor(chunkSize: number);
  getCacheKeys: (key: GridGetRowsParams) => GridGetRowsParams[];
  splitResponse: (key: GridGetRowsParams, response: GridGetRowsResponse) => Map<GridGetRowsParams, GridGetRowsResponse>;
  static mergeResponses: (responses: GridGetRowsResponse[]) => GridGetRowsResponse;
}