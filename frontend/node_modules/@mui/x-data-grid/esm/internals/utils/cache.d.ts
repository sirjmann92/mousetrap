import { GridGetRowsParams, GridGetRowsResponse } from "../../models/gridDataSource.js";
export declare class TestCache {
  private cache;
  constructor();
  set(key: GridGetRowsParams, value: GridGetRowsResponse): void;
  get(key: GridGetRowsParams): GridGetRowsResponse | undefined;
  size(): number;
  clear(): void;
}