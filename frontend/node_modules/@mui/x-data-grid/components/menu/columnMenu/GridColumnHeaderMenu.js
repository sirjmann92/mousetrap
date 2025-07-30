"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnHeaderMenu = GridColumnHeaderMenu;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _HTMLElementType = _interopRequireDefault(require("@mui/utils/HTMLElementType"));
var _useGridApiContext = require("../../../hooks/utils/useGridApiContext");
var _GridMenu = require("../GridMenu");
var _jsxRuntime = require("react/jsx-runtime");
function GridColumnHeaderMenu({
  columnMenuId,
  columnMenuButtonId,
  ContentComponent,
  contentComponentProps,
  field,
  open,
  target,
  onExited
}) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const colDef = apiRef.current.getColumn(field);
  const hideMenu = (0, _useEventCallback.default)(event => {
    if (event) {
      // Prevent triggering the sorting
      event.stopPropagation();
      if (target?.contains(event.target)) {
        return;
      }
    }
    apiRef.current.hideColumnMenu();
  });
  if (!target || !colDef) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridMenu.GridMenu, {
    position: `bottom-${colDef.align === 'right' ? 'start' : 'end'}`,
    open: open,
    target: target,
    onClose: hideMenu,
    onExited: onExited,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(ContentComponent, (0, _extends2.default)({
      colDef: colDef,
      hideMenu: hideMenu,
      open: open,
      id: columnMenuId,
      labelledby: columnMenuButtonId
    }, contentComponentProps))
  });
}
process.env.NODE_ENV !== "production" ? GridColumnHeaderMenu.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  columnMenuButtonId: _propTypes.default.string,
  columnMenuId: _propTypes.default.string,
  ContentComponent: _propTypes.default.elementType.isRequired,
  contentComponentProps: _propTypes.default.any,
  field: _propTypes.default.string.isRequired,
  onExited: _propTypes.default.func,
  open: _propTypes.default.bool.isRequired,
  target: _HTMLElementType.default
} : void 0;