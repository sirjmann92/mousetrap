import type { GridGetRowsParams, GridUpdateRowParams } from "../../../models/gridDataSource.js";
export declare class GridGetRowsError<T extends GridGetRowsParams = GridGetRowsParams> extends Error {
  /**
   * The parameters used in the failed request
   */
  readonly params: T;
  /**
   * The original error that caused this error
   */
  readonly cause?: Error;
  constructor(options: {
    message: string;
    params: T;
    cause?: Error;
  });
}
export declare class GridUpdateRowError extends Error {
  /**
   * The parameters used in the failed request
   */
  readonly params: GridUpdateRowParams;
  /**
   * The original error that caused this error
   */
  readonly cause?: Error;
  constructor(options: {
    message: string;
    params: GridUpdateRowParams;
    cause?: Error;
  });
}