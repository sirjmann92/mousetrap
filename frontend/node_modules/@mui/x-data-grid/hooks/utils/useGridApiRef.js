"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridApiRef = void 0;
var React = _interopRequireWildcard(require("react"));
/**
 * Hook that instantiate a [[GridApiRef]].
 */
const useGridApiRef = () => React.useRef(null);
exports.useGridApiRef = useGridApiRef;