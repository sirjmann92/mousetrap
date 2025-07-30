"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridMainContainer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _system = require("@mui/system");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _useGridConfiguration = require("../../hooks/utils/useGridConfiguration");
var _jsxRuntime = require("react/jsx-runtime");
const GridPanelAnchor = (0, _system.styled)('div')({
  position: 'absolute',
  top: `var(--DataGrid-headersTotalHeight)`,
  left: 0,
  width: 'calc(100% - (var(--DataGrid-hasScrollY) * var(--DataGrid-scrollbarSize)))'
});
const Element = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'Main',
  overridesResolver: (props, styles) => {
    const {
      ownerState,
      loadingOverlayVariant,
      overlayType
    } = props;
    const hideContent = loadingOverlayVariant === 'skeleton' || overlayType === 'noColumnsOverlay';
    return [styles.main, ownerState.hasPinnedRight && styles['main--hasPinnedRight'], hideContent && styles['main--hiddenContent']];
  }
})({
  flexGrow: 1,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
});
const GridMainContainer = exports.GridMainContainer = (0, _forwardRef.forwardRef)((props, ref) => {
  const {
    ownerState
  } = props;
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const configuration = (0, _useGridConfiguration.useGridConfiguration)();
  const ariaAttributes = configuration.hooks.useGridAriaAttributes();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Element, (0, _extends2.default)({
    ownerState: ownerState,
    className: props.className,
    tabIndex: -1
  }, ariaAttributes, rootProps.slotProps?.main, {
    ref: ref,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(GridPanelAnchor, {
      role: "presentation",
      "data-id": "gridPanelAnchor"
    }), props.children]
  }));
});
if (process.env.NODE_ENV !== "production") GridMainContainer.displayName = "GridMainContainer";