"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnMenuManageItem = GridColumnMenuManageItem;
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _gridPreferencePanelsValue = require("../../../../hooks/features/preferencesPanel/gridPreferencePanelsValue");
var _useGridApiContext = require("../../../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
function GridColumnMenuManageItem(props) {
  const {
    onClick
  } = props;
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const showColumns = React.useCallback(event => {
    onClick(event); // hide column menu
    apiRef.current.showPreferences(_gridPreferencePanelsValue.GridPreferencePanelsValue.columns);
  }, [apiRef, onClick]);
  if (rootProps.disableColumnSelector) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, {
    onClick: showColumns,
    iconStart: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.columnMenuManageColumnsIcon, {
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
  colDef: _propTypes.default.object.isRequired,
  onClick: _propTypes.default.func.isRequired
} : void 0;