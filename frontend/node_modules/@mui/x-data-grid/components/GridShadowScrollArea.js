"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridShadowScrollArea = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _system = require("@mui/system");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["children"];
const reveal = (0, _system.keyframes)({
  from: {
    opacity: 0
  },
  to: {
    opacity: 1
  }
});
const detectScroll = (0, _system.keyframes)({
  'from, to': {
    '--scrollable': '" "'
  }
});

// This `styled()` function invokes keyframes. `styled-components` only supports keyframes
// in string templates. Do not convert these styles in JS object as it will break.
const ShadowScrollArea = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'ShadowScrollArea'
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  animation: ${detectScroll};
  animation-timeline: --scroll-timeline;
  animation-fill-mode: none;
  box-sizing: border-box;
  overflow: auto;
  scrollbar-width: thin;
  scroll-timeline: --scroll-timeline block;

  &::before,
  &::after {
    content: '';
    flex-shrink: 0;
    display: block;
    position: sticky;
    left: 0;
    width: 100%;
    height: 4px;
    animation: ${reveal} linear both;
    animation-timeline: --scroll-timeline;

    // Custom property toggle trick:
    // - Detects if the element is scrollable
    // - https://css-tricks.com/the-css-custom-property-toggle-trick/
    --visibility-scrollable: var(--scrollable) visible;
    --visibility-not-scrollable: hidden;
    visibility: var(--visibility-scrollable, var(--visibility-not-scrollable));
  }

  &::before {
    top: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 0, transparent 100%);
    animation-range: 0 4px;
  }

  &::after {
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.05) 0, transparent 100%);
    animation-direction: reverse;
    animation-range: calc(100% - 4px) 100%;
  }
`;

/**
 * Adds scroll shadows above and below content in a scrollable container.
 */
const GridShadowScrollArea = exports.GridShadowScrollArea = (0, _forwardRef.forwardRef)(function GridShadowScrollArea(props, ref) {
  const {
      children
    } = props,
    rest = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(ShadowScrollArea, (0, _extends2.default)({}, rest, {
    ref: ref,
    children: children
  }));
});
if (process.env.NODE_ENV !== "production") GridShadowScrollArea.displayName = "GridShadowScrollArea";
process.env.NODE_ENV !== "production" ? GridShadowScrollArea.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: _propTypes.default.node
} : void 0;