export type ToolType =
  | 'move'
  | 'select'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'ellipse'
  | 'line'
  | 'line3'
  | 'text'
  | 'image'
  ;

export interface Toolbar {
  name: string;
  icon: string;
  key: string;
  action: ToolType;
}
