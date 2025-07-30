"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridVirtualScrollerFiller = void 0;
var React = _interopRequireWildcard(require("react"));
var _system = require("@mui/system");
var _fastMemo = require("@mui/x-internals/fastMemo");
var _cssVariables = require("../../constants/cssVariables");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _dimensions = require("../../hooks/features/dimensions");
var _constants = require("../../constants");
var _jsxRuntime = require("react/jsx-runtime");
const Filler = (0, _system.styled)('div')({
  display: 'flex',
  flexDirection: 'row',
  width: 'var(--DataGrid-rowWidth)',
  boxSizing: 'border-box'
});
const Pinned = (0, _system.styled)('div')({
  position: 'sticky',
  height: '100%',
  boxSizing: 'border-box',
  borderTop: '1px solid var(--rowBorderColor)',
  backgroundColor: _cssVariables.vars.cell.background.pinned
});
const PinnedLeft = (0, _system.styled)(Pinned)({
  left: 0,
  borderRight: '1px solid var(--rowBorderColor)'
});
const PinnedRight = (0, _system.styled)(Pinned)({
  right: 0,
  borderLeft: '1px solid var(--rowBorderColor)'
});
const Main = (0, _system.styled)('div')({
  flexGrow: 1,
  borderTop: '1px solid var(--rowBorderColor)'
});
function GridVirtualScrollerFiller({
  rowsLength
}) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const {
    viewportOuterSize,
    minimumSize,
    hasScrollX,
    hasScrollY,
    scrollbarSize,
    leftPinnedWidth,
    rightPinnedWidth
  } = (0, _useGridSelector.useGridSelector)(apiRef, _dimensions.gridDimensionsSelector);
  const height = hasScrollX ? scrollbarSize : 0;
  const needsLastRowBorder = viewportOuterSize.height - minimumSize.height > 0;
  if (height === 0 && !needsLastRowBorder) {
    return null;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Filler, {
    className: _constants.gridClasses.filler,
    role: "presentation",
    style: {
      height,
      '--rowBorderColor': rowsLength === 0 ? 'transparent' : 'var(--DataGrid-rowBorderColor)'
    },
    children: [leftPinnedWidth > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(PinnedLeft, {
      className: _constants.gridClasses['filler--pinnedLeft'],
      style: {
        width: leftPinnedWidth
      }
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Main, {}), rightPinnedWidth > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(PinnedRight, {
      className: _constants.gridClasses['filler--pinnedRight'],
      style: {
        width: rightPinnedWidth + (hasScrollY ? scrollbarSize : 0)
      }
    })]
  });
}
const Memoized = exports.GridVirtualScrollerFiller = (0, _fastMemo.fastMemo)(GridVirtualScrollerFiller);