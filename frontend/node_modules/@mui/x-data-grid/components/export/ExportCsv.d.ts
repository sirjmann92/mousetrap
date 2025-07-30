import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import { GridCsvExportOptions } from "../../models/gridExport.js";
import type { GridSlotProps } from "../../models/index.js";
export type ExportCsvProps = GridSlotProps['baseButton'] & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseButton']>;
  /**
   * The options to apply on the CSV export.
   * @demos
   *   - [CSV export](/x/react-data-grid/export/#csv-export)
   */
  options?: GridCsvExportOptions;
};
/**
 * A button that triggers a CSV export.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Export](https://mui.com/x/react-data-grid/components/export/)
 *
 * API:
 *
 * - [ExportCsv API](https://mui.com/x/api/data-grid/export-csv/)
 */
declare const ExportCsv: React.ForwardRefExoticComponent<ExportCsvProps> | React.ForwardRefExoticComponent<Omit<ExportCsvProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { ExportCsv };