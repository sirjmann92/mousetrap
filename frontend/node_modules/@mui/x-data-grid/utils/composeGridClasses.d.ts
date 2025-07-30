import composeClasses from '@mui/utils/composeClasses';
import type { DataGridProcessedProps } from "../models/props/DataGridProps.js";
export declare function composeGridClasses(classes: DataGridProcessedProps['classes'], slots: Parameters<typeof composeClasses>[0]): Record<string, string>;