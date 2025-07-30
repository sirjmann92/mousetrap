'use client';

import { useLocalizationContext } from "./usePickerAdapter.js";
export const usePickerTranslations = () => useLocalizationContext().localeText;