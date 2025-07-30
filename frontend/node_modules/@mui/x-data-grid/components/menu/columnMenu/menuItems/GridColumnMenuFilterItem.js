"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnMenuFilterItem = GridColumnMenuFilterItem;
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useGridApiContext = require("../../../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
function GridColumnMenuFilterItem(props) {
  const {
    colDef,
    onClick
  } = props;
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const showFilter = React.useCallback(event => {
    onClick(event);
    apiRef.current.showFilterPanel(colDef.field);
  }, [apiRef, colDef.field, onClick]);
  if (rootProps.disableColumnFilter || !colDef.filterable) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseMenuItem, {
    onClick: showFilter,
    iconStart: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.columnMenuFilterIcon, {
      fontSize: "small"
    }),
    children: apiRef.current.getLocaleText('columnMenuFilter')
  });
}
process.env.NODE_ENV !== "production" ? GridColumnMenuFilterItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: _propTypes.default.object.isRequired,
  onClick: _propTypes.default.func.isRequired
} : void 0;