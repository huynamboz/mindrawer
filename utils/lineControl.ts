import { Line, type FabricObject, Circle, type FabricObjectProps, type ObjectEvents, type SerializedObjectProps } from 'fabric';

export const CIRCLE_RADIUS = 6;

export function makeCircle(left: number, top: number, lines: Array<FabricObject | null>, pos: 'start' | 'mid' | 'end') {
  const c = new Circle({
    left: left,
    top: top,
    strokeWidth: 1,
    radius: CIRCLE_RADIUS,
    fill: '#fff',
    stroke: '#666',
  });
  c.hasControls = c.hasBorders = false;

  Object.assign(c, { lines, pos });

  return c;
}

export function makeLine(coords: [number, number, number, number]) {
  const line = new Line(coords, {
    fill: 'transparent',
    stroke: 'black',
    strokeWidth: 2,
    selectable: true,
    evented: true,
  });

  line.hasControls = line.hasBorders = false;
  Object.assign(line, { prevSelectable: line.selectable, prevEvented: line.evented });
  return line;
}

// MUST SET COORDS AFTER MODIFYING
export function updateLinePosition(target: FabricObject<Partial<FabricObjectProps>, SerializedObjectProps, ObjectEvents>, isCreating?: boolean) {
  const fabricStore = useFabricStore();

  const p = target;
  console.log(p);
  if ('pos' in p && 'lines' in p) {
    const firstLine = (p as any).lines[0] as Line;
    const secondLine = (p as any).lines[1] as Line;

    const middleX = (firstLine.get('x1') + p.left) / 2;
    const middleY = (firstLine.get('y1') + p.top) / 2;

    // When moving start point
    if (p.pos === 'start') {
      firstLine.set({ x1: p.left + CIRCLE_RADIUS, y1: p.top + CIRCLE_RADIUS });
    }
    // When moving middle point
    else if (p.pos === 'mid') {
      firstLine?.set({ x2: p.left + CIRCLE_RADIUS, y2: p.top + CIRCLE_RADIUS });
      secondLine?.set({ x1: p.left + CIRCLE_RADIUS, y1: p.top + CIRCLE_RADIUS });
      firstLine?.setCoords();
      secondLine?.setCoords();
    }
    // When moving end point
    else if (p.pos === 'end') {
      secondLine.set({ x2: p.left + CIRCLE_RADIUS, y2: p.top + CIRCLE_RADIUS });

      // When creating line3
      if (isCreating && fabricStore.activeTool === 'line3') {
        // set x2,y2 là trung điểm giữa 2 điểm đầu và cuối
        firstLine.set({
          x2: middleX + (CIRCLE_RADIUS / 2),
          y2: middleY + (CIRCLE_RADIUS / 2),
        });
        // set x1,y1 là trung điểm giữa 2 điểm đầu và cuối
        secondLine.set({
          x1: middleX + (CIRCLE_RADIUS / 2),
          y1: middleY + (CIRCLE_RADIUS / 2),
        });
        firstLine.setCoords();
        secondLine.setCoords();
        const middlePoint = (p as any).midPoint as Circle;
        if (middlePoint) {
          middlePoint.set({
            left: middleX - (CIRCLE_RADIUS / 2),
            top: middleY - (CIRCLE_RADIUS / 2),
          });
          middlePoint.setCoords();
        }
      }
    }
  }
}
