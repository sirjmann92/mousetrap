import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { GridPanelWrapper } from "./GridPanelWrapper.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
function GridColumnsPanel(props) {
  const rootProps = useGridRootProps();
  return /*#__PURE__*/_jsx(GridPanelWrapper, _extends({}, props, {
    children: /*#__PURE__*/_jsx(rootProps.slots.columnsManagement, _extends({}, rootProps.slotProps?.columnsManagement))
  }));
}
export { GridColumnsPanel };