import * as React from 'react';
import PropTypes from 'prop-types';
import { GridPreferencePanelsValue } from "../../../../hooks/features/preferencesPanel/gridPreferencePanelsValue.js";
import { useGridApiContext } from "../../../../hooks/utils/useGridApiContext.js";
import { useGridRootProps } from "../../../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
function GridColumnMenuManageItem(props) {
  const {
    onClick
  } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const showColumns = React.useCallback(event => {
    onClick(event); // hide column menu
    apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
  }, [apiRef, onClick]);
  if (rootProps.disableColumnSelector) {
    return null;
  }
  return /*#__PURE__*/_jsx(rootProps.slots.baseMenuItem, {
    onClick: showColumns,
    iconStart: /*#__PURE__*/_jsx(rootProps.slots.columnMenuManageColumnsIcon, {
      fontSize: "small"
    }),
    children: apiRef.current.getLocaleText('columnMenuManageColumns')
  });
}
process.env.NODE_ENV !== "production" ? GridColumnMenuManageItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired
} : void 0;
export { GridColumnMenuManageItem };