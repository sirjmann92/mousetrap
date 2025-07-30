import * as React from 'react';
import type { GridColDef } from "../../models/colDef/gridColDef.js";
import type { GridRenderCellParams } from "../../models/params/gridCellParams.js";
interface GridBooleanCellProps extends GridRenderCellParams {
  hideDescendantCount?: boolean;
}
declare function GridBooleanCellRaw(props: GridBooleanCellProps): React.JSX.Element | null;
declare namespace GridBooleanCellRaw {
  var propTypes: any;
}
declare const GridBooleanCell: React.MemoExoticComponent<typeof GridBooleanCellRaw>;
export { GridBooleanCell };
export declare const renderBooleanCell: GridColDef['renderCell'];