import * as React from 'react';
import { singleItemValueManager } from "../utils/valueManagers.js";
import { getTodayDate } from "../utils/date-utils.js";
import { SECTION_TYPE_GRANULARITY } from "../utils/getDefaultReferenceDate.js";
export const useClockReferenceDate = ({
  value,
  referenceDate: referenceDateProp,
  adapter,
  props,
  timezone
}) => {
  const referenceDate = React.useMemo(() => singleItemValueManager.getInitialReferenceValue({
    value,
    adapter,
    props,
    referenceDate: referenceDateProp,
    granularity: SECTION_TYPE_GRANULARITY.day,
    timezone,
    getTodayDate: () => getTodayDate(adapter, timezone, 'date')
  }),
  // We want the `referenceDate` to update on prop and `timezone` change (https://github.com/mui/mui-x/issues/10804)
  [referenceDateProp, timezone] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return value ?? referenceDate;
};