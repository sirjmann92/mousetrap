"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridRefs = void 0;
var React = _interopRequireWildcard(require("react"));
const useGridRefs = apiRef => {
  const rootElementRef = React.useRef(null);
  const mainElementRef = React.useRef(null);
  const virtualScrollerRef = React.useRef(null);
  const virtualScrollbarVerticalRef = React.useRef(null);
  const virtualScrollbarHorizontalRef = React.useRef(null);
  const columnHeadersContainerRef = React.useRef(null);
  apiRef.current.register('public', {
    rootElementRef
  });
  apiRef.current.register('private', {
    mainElementRef,
    virtualScrollerRef,
    virtualScrollbarVerticalRef,
    virtualScrollbarHorizontalRef,
    columnHeadersContainerRef
  });
};
exports.useGridRefs = useGridRefs;