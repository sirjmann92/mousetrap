"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useNow = exports.useDefaultDates = void 0;
var React = _interopRequireWildcard(require("react"));
var _usePickerAdapter = require("../../hooks/usePickerAdapter");
const useDefaultDates = () => (0, _usePickerAdapter.useLocalizationContext)().defaultDates;
exports.useDefaultDates = useDefaultDates;
const useNow = timezone => {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const now = React.useRef(undefined);
  if (now.current === undefined) {
    now.current = adapter.date(undefined, timezone);
  }
  return now.current;
};
exports.useNow = useNow;