"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridInitialization = void 0;
var _useGridRefs = require("./useGridRefs");
var _useGridIsRtl = require("./useGridIsRtl");
var _useGridLoggerFactory = require("./useGridLoggerFactory");
var _useGridLocaleText = require("./useGridLocaleText");
var _pipeProcessing = require("./pipeProcessing");
var _strategyProcessing = require("./strategyProcessing");
var _useGridStateInitialization = require("./useGridStateInitialization");
var _useGridProps = require("./useGridProps");
/**
 * Initialize the technical pieces of the DataGrid (logger, state, ...) that any DataGrid implementation needs
 */
const useGridInitialization = (privateApiRef, props) => {
  (0, _useGridRefs.useGridRefs)(privateApiRef);
  (0, _useGridProps.useGridProps)(privateApiRef, props);
  (0, _useGridIsRtl.useGridIsRtl)(privateApiRef);
  (0, _useGridLoggerFactory.useGridLoggerFactory)(privateApiRef, props);
  (0, _useGridStateInitialization.useGridStateInitialization)(privateApiRef);
  (0, _pipeProcessing.useGridPipeProcessing)(privateApiRef);
  (0, _strategyProcessing.useGridStrategyProcessing)(privateApiRef);
  (0, _useGridLocaleText.useGridLocaleText)(privateApiRef, props);
  privateApiRef.current.register('private', {
    rootProps: props
  });
};
exports.useGridInitialization = useGridInitialization;