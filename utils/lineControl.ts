import {
  Line,
  type FabricObject,
  Point,
  Circle,
  type FabricObjectProps,
  type ObjectEvents,
  type SerializedObjectProps,
} from 'fabric';
import { v4 as uuidv4 } from 'uuid';

export const CIRCLE_RADIUS = 6;

export function makeCircle(
  left: number,
  top: number,
  lines: Array<FabricObject | null>,
  pos: 'start' | 'mid' | 'end',
) {
  const c = new Circle({
    id: uuidv4(),
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
    id: uuidv4(),
    fill: 'transparent',
    stroke: 'black',
    strokeWidth: 2,
    selectable: true,
    evented: true,
  });

  // must select by per pixel to select line
  line.perPixelTargetFind = true;
  line.hasControls = line.hasBorders = false;
  Object.assign(line, {
    prevSelectable: line.selectable,
    prevEvented: line.evented,
  });
  return line;
}

// MUST SET COORDS AFTER MODIFYING
export function updateLinePosition(
  target: FabricObject<
    Partial<FabricObjectProps>,
    SerializedObjectProps,
    ObjectEvents
  >,
  isCreating?: boolean,
) {
  const fabricStore = useFabricStore();

  const p = target;

  if (p.type === 'line') {
    const pointIds = p.get('pointIds') as string[];
    console.log(pointIds);
    if (pointIds && pointIds.length === 2) {
      const firstPoint = fabricStore?.getObjectById(pointIds[0]) as Circle;
      const secondPoint = fabricStore?.getObjectById(pointIds[1]) as Circle;

      const { point1, point2 } = calcLinePoints(p as Line);

      firstPoint.set({
        left: point1.x - CIRCLE_RADIUS,
        top: point1.y - CIRCLE_RADIUS,
      });
      secondPoint.set({
        left: point2.x - CIRCLE_RADIUS,
        top: point2.y - CIRCLE_RADIUS,
      });

      firstPoint.setCoords();
      secondPoint.setCoords();
    }
  }
  else if (p.type === 'circle') {
    if ('pos' in p && 'lines' in p) {
      const firstLineId = (p as any).lines[0] as string;
      const secondLineId = (p as any).lines[1] as string;
      const firstLine = fabricStore?.getObjectById(firstLineId) as Line;
      const secondLine = fabricStore?.getObjectById(secondLineId) as Line;

      const { point1: firstLineStart, point2: firstLineEnd } = calcLinePoints(firstLine);
      const { point1: secondLineStart, point2: secondLineEnd } = calcLinePoints(secondLine);
      const middleX = (firstLineStart.x + p.left) / 2;
      const middleY = (firstLineStart.y + p.top) / 2;

      // When moving start point
      if (p.pos === 'start') {
        firstLine.set({
          x1: p.left + CIRCLE_RADIUS,
          y1: p.top + CIRCLE_RADIUS,
          x2: firstLineEnd.x,
          y2: firstLineEnd.y,
        });
        firstLine?.setCoords(); // if not setCoords, the line will not be updated & cant select
      }
      // When moving middle point
      else if (p.pos === 'mid') {
        firstLine?.set({
          x1: firstLineStart.x,
          y1: firstLineStart.y,
          x2: p.left + CIRCLE_RADIUS,
          y2: p.top + CIRCLE_RADIUS,
        });
        secondLine?.set({
          x1: p.left + CIRCLE_RADIUS,
          y1: p.top + CIRCLE_RADIUS,
          x2: secondLineEnd.x,
          y2: secondLineEnd.y,
        });
        firstLine?.setCoords();
        secondLine?.setCoords();
      }
      // When moving end point
      else if (p.pos === 'end') {
        secondLine.set({
          x1: secondLineStart.x,
          y1: secondLineStart.y,
          x2: p.left + CIRCLE_RADIUS,
          y2: p.top + CIRCLE_RADIUS,
        });
        secondLine.setCoords();

        // When creating line3
        if (isCreating && fabricStore.activeTool === 'line3') {
          // set x2,y2 là trung điểm giữa 2 điểm đầu và cuối
          firstLine.set({
            x2: middleX + CIRCLE_RADIUS / 2,
            y2: middleY + CIRCLE_RADIUS / 2,
          });
          // set x1,y1 là trung điểm giữa 2 điểm đầu và cuối
          secondLine.set({
            x1: middleX + CIRCLE_RADIUS / 2,
            y1: middleY + CIRCLE_RADIUS / 2,
          });
          firstLine.setCoords();
          secondLine.setCoords();
          const middlePoint = fabricStore?.getObjectById(p.get('midPointId')) as Circle;
          if (middlePoint) {
            middlePoint.set({
              left: middleX - CIRCLE_RADIUS / 2,
              top: middleY - CIRCLE_RADIUS / 2,
            });
            middlePoint.setCoords();
          }
        }
      }
    }
  }
}

/**
 * Calculate new position of 2 points of Line because x1, y1, x2, y2 will not change position when moving
 * @param obj
 * @returns
 * @example
 * const { point1, point2 } = calcLinePoints(line);
 * console.log(point1, point2);
 * // { x: 100, y: 100 } { x: 200, y: 200 }
  */
function calcLinePoints(obj: Line) {
  const points = obj.calcLinePoints();
  const matrix = obj.calcTransformMatrix();
  const point1 = new Point(points.x1, points.y1).transform(matrix);
  const point2 = new Point(points.x2, points.y2).transform(matrix);
  return { point1, point2 };
}
