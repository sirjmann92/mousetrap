"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridLoggerFactory = void 0;
var React = _interopRequireWildcard(require("react"));
var _utils = require("../../utils/utils");
var _utils2 = require("../utils");
const forceDebug = (0, _utils.localStorageAvailable)() && window.localStorage.getItem('DEBUG') != null;
const noop = () => {};
const noopLogger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop
};
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
function getAppender(name, logLevel, appender = console) {
  const minLogLevelIdx = LOG_LEVELS.indexOf(logLevel);
  if (minLogLevelIdx === -1) {
    throw new Error(`MUI X: Log level ${logLevel} not recognized.`);
  }
  const logger = LOG_LEVELS.reduce((loggerObj, method, idx) => {
    if (idx >= minLogLevelIdx) {
      loggerObj[method] = (...args) => {
        const [message, ...other] = args;
        appender[method](`MUI X: ${name} - ${message}`, ...other);
      };
    } else {
      loggerObj[method] = noop;
    }
    return loggerObj;
  }, {});
  return logger;
}
const useGridLoggerFactory = (apiRef, props) => {
  const getLogger = React.useCallback(name => {
    if (forceDebug) {
      return getAppender(name, 'debug', props.logger);
    }
    if (!props.logLevel) {
      return noopLogger;
    }
    return getAppender(name, props.logLevel.toString(), props.logger);
  }, [props.logLevel, props.logger]);
  (0, _utils2.useGridApiMethod)(apiRef, {
    getLogger
  }, 'private');
};
exports.useGridLoggerFactory = useGridLoggerFactory;