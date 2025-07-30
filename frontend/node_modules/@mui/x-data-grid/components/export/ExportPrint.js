"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExportPrint = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "options", "onClick"];
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
const ExportPrint = exports.ExportPrint = (0, _forwardRef.forwardRef)(function ExportPrint(props, ref) {
  const {
      render,
      options,
      onClick
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const handleClick = event => {
    apiRef.current.exportDataAsPrint(options);
    onClick?.(event);
  };
  const element = (0, _useComponentRenderer.useComponentRenderer)(rootProps.slots.baseButton, render, (0, _extends2.default)({}, rootProps.slotProps?.baseButton, {
    onClick: handleClick
  }, other, {
    ref
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ExportPrint.displayName = "ExportPrint";
process.env.NODE_ENV !== "production" ? ExportPrint.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: _propTypes.default.string,
  disabled: _propTypes.default.bool,
  id: _propTypes.default.string,
  /**
   * The options to apply on the Print export.
   * @demos
   *   - [Print export](/x/react-data-grid/export/#print-export)
   */
  options: _propTypes.default.shape({
    allColumns: _propTypes.default.bool,
    bodyClassName: _propTypes.default.string,
    copyStyles: _propTypes.default.bool,
    fields: _propTypes.default.arrayOf(_propTypes.default.string),
    fileName: _propTypes.default.string,
    getRowsToExport: _propTypes.default.func,
    hideFooter: _propTypes.default.bool,
    hideToolbar: _propTypes.default.bool,
    includeCheckboxes: _propTypes.default.bool,
    pageStyle: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string])
  }),
  /**
   * A function to customize rendering of the component.
   */
  render: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.func]),
  role: _propTypes.default.string,
  size: _propTypes.default.oneOf(['large', 'medium', 'small']),
  startIcon: _propTypes.default.node,
  style: _propTypes.default.object,
  tabIndex: _propTypes.default.number,
  title: _propTypes.default.string,
  touchRippleRef: _propTypes.default.any
} : void 0;