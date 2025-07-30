'use client';

import { useField } from "../internals/hooks/useField/index.js";
import { useDateTimeManager } from "../managers/index.js";
export const useDateTimeField = props => {
  const manager = useDateTimeManager(props);
  return useField({
    manager,
    props
  });
};