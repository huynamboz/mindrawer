export type ToolType = 'move' | 'select' | 'rect' | 'circle' | 'triangle' | 'ellipse' | 'line' | 'line3';

export interface Toolbar {
  name: string;
  icon: string;
  action: ToolType;
}
