export interface EditorSetting {
  theme: string;
  grid: boolean;
  gridColor: string;
  gridSize: number;
  gridSizeUnit: string;
  gridSizeUnitOptions: string[];

  // Object setting
  fill: string;
  recentFillColors: string[];
  stroke: string;
  recentStrokeColors: string[];
  strokeWidth: number;
  strokeDashArray: number[];
  opacity: number;
}
