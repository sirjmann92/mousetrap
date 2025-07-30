import type { GridGetRowsParams, GridGetRowsResponse } from "../../../models/gridDataSource.js";
export type GridDataSourceCacheDefaultConfig = {
  /**
   * Time To Live for each cache entry in milliseconds.
   * After this time the cache entry will become stale and the next query will result in cache miss.
   * @default 300_000 (5 minutes)
   */
  ttl?: number;
  /**
   * Function to generate a cache key from the params.
   * @param {GridGetRowsParams} params The params to generate the cache key from.
   * @returns {string} The cache key.
   * @default `getKeyDefault()`
   */
  getKey?: (params: GridGetRowsParams) => string;
};
export declare function getKeyDefault(params: GridGetRowsParams): string;
export declare class GridDataSourceCacheDefault {
  private cache;
  private ttl;
  private getKey;
  constructor({
    ttl,
    getKey
  }: GridDataSourceCacheDefaultConfig);
  set(key: GridGetRowsParams, value: GridGetRowsResponse): void;
  get(key: GridGetRowsParams): GridGetRowsResponse | undefined;
  clear(): void;
}