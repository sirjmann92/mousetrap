import * as React from 'react';
import { GridColumnHeaderParams } from "../../models/params/gridColumnHeaderParams.js";
export interface ColumnHeaderFilterIconButtonProps {
  field: string;
  counter?: number;
  onClick?: (params: GridColumnHeaderParams, event: React.MouseEvent<HTMLButtonElement>) => void;
}
declare function GridColumnHeaderFilterIconButtonWrapped(props: ColumnHeaderFilterIconButtonProps): React.JSX.Element | null;
declare namespace GridColumnHeaderFilterIconButtonWrapped {
  var propTypes: any;
}
export { GridColumnHeaderFilterIconButtonWrapped as GridColumnHeaderFilterIconButton };