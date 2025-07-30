import * as React from 'react';
import { RenderProp } from '@mui/x-internals/useComponentRenderer';
import { GridPrintExportOptions } from "../../models/gridExport.js";
import type { GridSlotProps } from "../../models/index.js";
export type ExportPrintProps = GridSlotProps['baseButton'] & {
  /**
   * A function to customize rendering of the component.
   */
  render?: RenderProp<GridSlotProps['baseButton']>;
  /**
   * The options to apply on the Print export.
   * @demos
   *   - [Print export](/x/react-data-grid/export/#print-export)
   */
  options?: GridPrintExportOptions;
};
/**
 * A button that triggers a print export.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Export](https://mui.com/x/react-data-grid/components/export/)
 *
 * API:
 *
 * - [ExportPrint API](https://mui.com/x/api/data-grid/export-print/)
 */
declare const ExportPrint: React.ForwardRefExoticComponent<ExportPrintProps> | React.ForwardRefExoticComponent<Omit<ExportPrintProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { ExportPrint };