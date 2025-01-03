export type ToolType = 'move' | 'select' | 'rect' | 'circle' | 'triangle' | 'ellipse';

export interface Toolbar {
  name: string;
  icon: string;
  action: ToolType;
}
