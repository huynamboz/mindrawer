import {
  type Group,
  Line,
  type FabricObject,
  Point,
  Circle,
  type FabricObjectProps,
  type ObjectEvents,
  type SerializedObjectProps,
  type ActiveSelection,
} from 'fabric';
import { v4 as uuidv4 } from 'uuid';

export const CIRCLE_RADIUS = 4;

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
    stroke: '#0b99ff',
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
    strokeWidth: 1,
    selectable: true,
    evented: true,
    noScaleCache: false,
    strokeUniform: true,
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

  // Trường hợp line có 2 control points (pointIds.length === 2)
  if (p.type === 'line') {
    const pointIds = p.get('pointIds') as string[];
    const lineIds = p.get('lineIds') as string[];
    console.log(pointIds);

    // Nếu line có 2 control points
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

    // Nếu line có 3 control points
    else if (pointIds && pointIds.length === 3) {
      const firstPoint = fabricStore?.getObjectById(pointIds[0]) as Circle;
      const midPoint = fabricStore?.getObjectById(pointIds[1]) as Circle;
      const endPoint = fabricStore?.getObjectById(pointIds[2]) as Circle;

      const firstLine = fabricStore?.getObjectById(lineIds[0]) as Line;
      const secondLine = fabricStore?.getObjectById(lineIds[1]) as Line;

      const isMoveFirstLine = firstLine.get('id') === p.get('id');
      // Tính toán vị trí các điểm
      const {
        point1: pointFirstOfLineTarget,
        point2: pointSecondOfLineTarget,
      } = calcLinePoints(p as Line);

      let movedX = 0,
        movedY = 0;

      // if move first line
      if (isMoveFirstLine) {
        const { point2: pointSecondOfSecondLine } = calcLinePoints(
          secondLine as Line,
        );
        console.log('moving first line');
        // tính toán khoảng cách di chuyển - nếu di chuyển first line thì khoảng
        // cách di chuyển bằng điểm đầu của firstpoint point trừ cho điểm đầu sau khi di chuyển của first line (vì point chưa di chuyển)
        movedX = firstPoint.left - (pointFirstOfLineTarget.x - CIRCLE_RADIUS);
        movedY = firstPoint.top - (pointFirstOfLineTarget.y - CIRCLE_RADIUS);

        firstPoint.set({
          left: pointFirstOfLineTarget.x - CIRCLE_RADIUS,
          top: pointFirstOfLineTarget.y - CIRCLE_RADIUS,
        });

        midPoint.set({
          left: pointSecondOfLineTarget.x - CIRCLE_RADIUS,
          top: pointSecondOfLineTarget.y - CIRCLE_RADIUS,
        });

        // điểm cuối sẽ đi theo x2, y2 của second line
        endPoint.set({
          left: pointSecondOfSecondLine.x - movedX - CIRCLE_RADIUS,
          top: pointSecondOfSecondLine.y - movedY - CIRCLE_RADIUS,
        });

        const group = fabricStore.canvas?.getActiveObject();
        if (group && group.type !== 'activeselection') {
          secondLine.set({
            x1: pointSecondOfLineTarget.x,
            y1: pointSecondOfLineTarget.y,
            // tính toán khoảng cách sau khi di chuyển từ vị trí ban đầu
            x2: pointSecondOfSecondLine.x - movedX,
            y2: pointSecondOfSecondLine.y - movedY,
          });
        }
      }
      else {
        const { point1: pointFirstOfFirstLine } = calcLinePoints(
          firstLine as Line,
        );
        // tính toán khoảng cách di chuyển - nếu di chuyển second line thì khoảng
        // cách di chuyển bằng điểm đầu của mid point trừ cho điểm đầu  sau khi di chuyển của second line (vì point chưa di chuyển)
        movedX = midPoint.left - (pointFirstOfLineTarget.x - CIRCLE_RADIUS);
        movedY = midPoint.top - (pointFirstOfLineTarget.y - CIRCLE_RADIUS);

        console.log(
          'moving second line',
          pointFirstOfFirstLine.x,
          firstLine.get('x1'),
        );
        firstPoint.set({
          left: firstPoint.left - movedX,
          top: firstPoint.top - movedY,
        });

        midPoint.set({
          left: pointFirstOfLineTarget.x - CIRCLE_RADIUS,
          top: pointFirstOfLineTarget.y - CIRCLE_RADIUS,
        });

        // điểm cuối sẽ đi theo x2, y2 của second line
        endPoint.set({
          left: pointSecondOfLineTarget.x - CIRCLE_RADIUS,
          top: pointSecondOfLineTarget.y - CIRCLE_RADIUS,
        });

        const group = fabricStore.canvas?.getActiveObject() as ActiveSelection;
        if (group && group.type !== 'activeselection') {
          firstLine.set({
            x2: pointFirstOfLineTarget.x,
            y2: pointFirstOfLineTarget.y,
            // tính toán khoảng cách sau khi di chuyển từ vị trí ban đầu
            x1: pointFirstOfFirstLine.x - movedX,
            y1: pointFirstOfFirstLine.y - movedY,
          });
        }
      }

      firstPoint.setCoords();
      console.log('first point', firstPoint.left);
      midPoint.setCoords();
      endPoint.setCoords();
      firstLine.setCoords();
      secondLine.setCoords();
    }
  }

  // Trường hợp circle
  else if (p.type === 'circle') {
    if ('pos' in p && 'lines' in p) {
      const firstLineId = (p as any).lines[0] as string;
      const secondLineId = (p as any).lines[1] as string;
      const firstLine = fabricStore?.getObjectById(firstLineId) as Line;
      const secondLine = fabricStore?.getObjectById(secondLineId) as Line;

      const { point1: firstLineStart, point2: firstLineEnd }
        = calcLinePoints(firstLine);
      const { point1: secondLineStart, point2: secondLineEnd }
        = calcLinePoints(secondLine);
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
          const middlePoint = fabricStore?.getObjectById(
            p.get('midPointId'),
          ) as Circle;
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
export function calcLinePoints(obj: Line) {
  const points = obj.calcLinePoints();
  const matrix = obj.calcTransformMatrix();
  const point1 = new Point(points.x1, points.y1).transform(matrix);
  const point2 = new Point(points.x2, points.y2).transform(matrix);
  return { point1, point2 };
}

export function updateLinePositionWrapper(target: FabricObject) {
  const canvas = useFabricStore().canvas;
  if (!canvas) return;

  const group = canvas.getActiveObject();
  if (group && group.type === 'activeselection') {
    (group as Group).forEachObject((o) => {
      updateLinePosition(o);
    });
  }
  else {
    updateLinePosition(target);
  }
}

export function updateLineThreeControlPosition() {}
