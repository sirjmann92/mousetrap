"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useClockReferenceDate = void 0;
var React = _interopRequireWildcard(require("react"));
var _valueManagers = require("../utils/valueManagers");
var _dateUtils = require("../utils/date-utils");
var _getDefaultReferenceDate = require("../utils/getDefaultReferenceDate");
const useClockReferenceDate = ({
  value,
  referenceDate: referenceDateProp,
  adapter,
  props,
  timezone
}) => {
  const referenceDate = React.useMemo(() => _valueManagers.singleItemValueManager.getInitialReferenceValue({
    value,
    adapter,
    props,
    referenceDate: referenceDateProp,
    granularity: _getDefaultReferenceDate.SECTION_TYPE_GRANULARITY.day,
    timezone,
    getTodayDate: () => (0, _dateUtils.getTodayDate)(adapter, timezone, 'date')
  }),
  // We want the `referenceDate` to update on prop and `timezone` change (https://github.com/mui/mui-x/issues/10804)
  [referenceDateProp, timezone] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return value ?? referenceDate;
};
exports.useClockReferenceDate = useClockReferenceDate;