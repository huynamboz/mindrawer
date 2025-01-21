/* eslint-disable no-empty-character-class */
import {
  Triangle,
  type FabricObjectProps,
  Rect,
  Circle,
  Ellipse,
  Textbox,
  Canvas,
} from 'fabric';
import { v4 as uuidv4 } from 'uuid';

// import { type ObjectEvents, type FabricObject, type Line, type Group, Circle, type Rect, type Ellipse, type Triangle, type FabricObjectProps, type SerializedObjectProps } from 'fabric';
import { assignEventToObj } from '../fabricEventHandler';
import {
  makeLine,
  makeCircle,
  CIRCLE_RADIUS,
} from './lineControl';
import type { ToolType } from '~/types/toolbar';
import { ObjectCustomType } from '~/types/fabric';

export const defaultObjectControl = {
  cornerColor: 'white',
  cornerStrokeColor: '#0b99ff',
  borderColor: '#0b99ff',
  cornerSize: 6,
  transparentCorners: false,
};

export const defaultObjectOptions = {
  fill: 'transparent',
  stroke: 'black',
  strokeWidth: 1,
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  evented: true,
  selectable: true,
  prevEvented: true,
  prevSelectable: true,
  perPixelTargetFind: true,
  ...defaultObjectControl,
  // set strokeUniform and noScaleCache to not resize stroke when resize object
  strokeUniform: true,
  noScaleCache: false,
};

export function createFabricObject(
  type: ToolType,
  option: Partial<FabricObjectProps>,
) {
  const fabricStore = useFabricStore();
  const fabricSetting = useFabricSettingStore();

  defaultObjectOptions.fill = fabricSetting.getObjSetting('fill');
  defaultObjectOptions.stroke = fabricSetting.getObjSetting('stroke');
  defaultObjectOptions.strokeWidth = fabricSetting.getObjSetting('strokeWidth');

  const canvas = fabricStore.canvas;
  const options = { ...defaultObjectOptions, ...option };
  switch (type) {
    case 'line':
    { const { x: x1, y: y1 } = fabricStore.mousePosition;

      const line = makeLine([x1, y1, x1, y1], ObjectCustomType.LINE_TWO_POINT);
      assignEventToObj(line);
      const lineId = line.get('id');

      const firstPoint = makeCircle(
        line.get('x1') - CIRCLE_RADIUS,
        line.get('y1') - CIRCLE_RADIUS,
        [lineId, lineId],
        'start',
      );
      const endPoint = makeCircle(
        line.get('x2') - CIRCLE_RADIUS / 2,
        line.get('y2') - CIRCLE_RADIUS / 2,
        [lineId, lineId],
        'end',
      );

      canvas?.add(line, firstPoint);
      canvas?.bringObjectToFront(firstPoint);

      line.set({
        pointIds: [firstPoint.get('id'), endPoint.get('id')],
      });

      return endPoint;
    }
    case 'line3':
    { const { x: x1, y: y1 } = fabricStore.mousePosition;

      const line = makeLine([x1, y1, x1, y1], ObjectCustomType.LINE_THREE_POINT);
      const line2 = makeLine([x1, y1, x1, y1], ObjectCustomType.LINE_THREE_POINT);
      const lineId = line.get('id');
      const lineId2 = line2.get('id');

      [line, line2].forEach((l) => {
        assignEventToObj(l);
      });

      const firstPoint = makeCircle(
        line.get('x1') - CIRCLE_RADIUS,
        line.get('y1') - CIRCLE_RADIUS,
        [lineId, lineId2],
        'start',
      );
      const midPoint = makeCircle(
        line.get('x2'),
        line.get('y2'),
        [lineId, lineId2],
        'mid',
      );
      const endPoint = makeCircle(
        line.get('x2'),
        line.get('y2'),
        [lineId, lineId2],
        'end',
      );

      canvas?.add(line, line2, firstPoint, midPoint);
      canvas?.bringObjectToFront(firstPoint);
      canvas?.bringObjectToFront(midPoint);

      const groupId = uuidv4();
      endPoint.set({
        groupId,
        midPointId: midPoint.get('id'),
      });

      line.set({
        groupId,
        pointIds: [
          firstPoint.get('id'),
          midPoint.get('id'),
          endPoint.get('id'),
        ],
        lineIds: [lineId, lineId2],
      });

      line2.set({
        groupId,
        pointIds: [
          firstPoint.get('id'),
          midPoint.get('id'),
          endPoint.get('id'),
        ],
        lineIds: [lineId, lineId2],
      });
      return endPoint; }

    case 'triangle': {
      const triangle = new Triangle(options);
      assignEventToObj(triangle);
      return triangle;
    }

    case 'rect': {
      const rect = new Rect(options);
      assignEventToObj(rect);
      return rect;
    }

    case 'circle':
      return new Circle(options);

    case 'ellipse': {
      const ellipse = new Ellipse({
        ...options,
        rx: 0,
        ry: 0,
        fill: fabricSetting.getObjSetting('fill'),
        stroke: fabricSetting.getObjSetting('stroke'),
      });
      assignEventToObj(ellipse);
      return ellipse;
    }

    case 'text': {
      const textbox = new Textbox('', {
        id: uuidv4(),
        fontSize: fabricSetting.getObjSetting('fontSize'),
        top: option.top,
        left: option.left,
        editingBorderColor: 'transparent',
        objectCaching: false,
        charSpacing: 1, // fix cursor wrong position when apply custom font
        fontWeight: fabricSetting.getObjSetting('fontWeight'),
        stroke: fabricSetting.getObjSetting('stroke'),
        fill: fabricSetting.getObjSetting('stroke'),
        fontFamily: fabricSetting.getObjSetting('fontFamily'),
        _wordJoiners: /[]/,
        dirty: false,
        ...defaultObjectControl,
      });
      assignEventToObj(textbox);
      return textbox;
    }

    default:
      return new Rect(options);
  }
}

export async function exportObjectSelected(type: 'jpeg' | 'png') {
  const fabricStore = useFabricStore();

  const canvasInitial = fabricStore.canvas;

  if (!canvasInitial) return null;

  // const selectedObjects = fabricStore.canvas?.getActiveObjects();
  // if (!selectedObjects) return null;

  // const url = canvas.toDataURL({
  //   format: 'png',
  //   quality: 1,
  //   width: canvas.width,
  //   height: canvas.height,
  //   left: 0,
  //   top: 0,
  //   multiplier: 2,
  // });

  const activeSelection = canvasInitial.getActiveObject();
  const tempFabricCanvasElement = document.createElement('canvas');
  const tempFabricCanvas = new Canvas(tempFabricCanvasElement, {
    width: activeSelection?.width,
    height: activeSelection?.height,
  });

  if (activeSelection) {
    const cloned = await activeSelection.clone();
    tempFabricCanvas.add(cloned);
    tempFabricCanvas.renderAll();
    tempFabricCanvas.forEachObject((obj) => {
      obj.set({
        top: 0,
        left: 0,
      });
    });
  }

  const url = tempFabricCanvas.toDataURL({
    format: type,
    quality: 1,
    left: 0,
    top: 0,
    multiplier: 2,
    width: activeSelection?.width,
    height: activeSelection?.height,
  });

  const link = document.createElement('a');
  link.href = url;
  link.download = 'export-jpg';
  link.click();

  tempFabricCanvas.dispose();
}
