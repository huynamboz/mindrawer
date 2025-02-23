export interface ObjectSetting {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDashArray: number[];
  opacity: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  rx: number;
  ry: number;
}
export interface EditorSetting {
  theme: string;
  grid: boolean;
  gridColor: string;
  gridSize: number;
  gridSizeUnit: string;
  gridSizeUnitOptions: string[];

  // Object setting
  recentFillColors: string[];
  recentStrokeColors: string[];
}
