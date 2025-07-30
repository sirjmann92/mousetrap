'use client';

import { useField } from "../internals/hooks/useField/index.js";
import { useTimeManager } from "../managers/index.js";
export const useTimeField = props => {
  const manager = useTimeManager(props);
  return useField({
    manager,
    props
  });
};