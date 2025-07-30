'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
export const propsStateInitializer = (state, props) => {
  return _extends({}, state, {
    props: {
      listView: props.listView,
      getRowId: props.getRowId
    }
  });
};
export const useGridProps = (apiRef, props) => {
  React.useEffect(() => {
    apiRef.current.setState(state => _extends({}, state, {
      props: {
        listView: props.listView,
        getRowId: props.getRowId
      }
    }));
  }, [apiRef, props.listView, props.getRowId]);
};