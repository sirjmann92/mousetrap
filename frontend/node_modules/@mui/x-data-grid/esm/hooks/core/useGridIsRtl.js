'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useRtl } from '@mui/system/RtlProvider';
export const useGridIsRtl = apiRef => {
  const isRtl = useRtl();
  if (apiRef.current.state.isRtl === undefined) {
    apiRef.current.state.isRtl = isRtl;
  }
  const isFirstEffect = React.useRef(true);
  React.useEffect(() => {
    if (isFirstEffect.current) {
      isFirstEffect.current = false;
    } else {
      apiRef.current.setState(state => _extends({}, state, {
        isRtl
      }));
    }
  }, [apiRef, isRtl]);
};