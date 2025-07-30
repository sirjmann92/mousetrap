'use client';

import { useField } from "../internals/hooks/useField/index.js";
import { useDateManager } from "../managers/index.js";
export const useDateField = props => {
  const manager = useDateManager(props);
  return useField({
    manager,
    props
  });
};