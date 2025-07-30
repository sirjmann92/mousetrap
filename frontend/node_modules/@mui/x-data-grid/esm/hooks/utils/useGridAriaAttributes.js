import { gridVisibleColumnDefinitionsSelector } from "../features/columns/gridColumnsSelector.js";
import { useGridSelector } from "./useGridSelector.js";
import { useGridRootProps } from "./useGridRootProps.js";
import { gridColumnGroupsHeaderMaxDepthSelector } from "../features/columnGrouping/gridColumnGroupsSelector.js";
import { gridPinnedRowsCountSelector } from "../features/rows/gridRowsSelector.js";
import { useGridPrivateApiContext } from "./useGridPrivateApiContext.js";
import { isMultipleRowSelectionEnabled } from "../features/rowSelection/utils.js";
import { gridExpandedRowCountSelector } from "../features/filter/gridFilterSelector.js";
export const useGridAriaAttributes = () => {
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const visibleColumns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const accessibleRowCount = useGridSelector(apiRef, gridExpandedRowCountSelector);
  const headerGroupingMaxDepth = useGridSelector(apiRef, gridColumnGroupsHeaderMaxDepthSelector);
  const pinnedRowsCount = useGridSelector(apiRef, gridPinnedRowsCountSelector);
  const ariaLabel = rootProps['aria-label'];
  const ariaLabelledby = rootProps['aria-labelledby'];
  // `aria-label` and `aria-labelledby` should take precedence over `label`
  const shouldUseLabelAsAriaLabel = !ariaLabel && !ariaLabelledby && rootProps.label;
  return {
    role: 'grid',
    'aria-label': shouldUseLabelAsAriaLabel ? rootProps.label : ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-colcount': visibleColumns.length,
    'aria-rowcount': headerGroupingMaxDepth + 1 + pinnedRowsCount + accessibleRowCount,
    'aria-multiselectable': isMultipleRowSelectionEnabled(rootProps)
  };
};