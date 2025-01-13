import {
  type IText,
  Triangle,
  type FabricObjectProps,
  Rect,
  Circle,
  Line,
  Ellipse,
  Textbox,
} from 'fabric';
import { v4 as uuidv4 } from 'uuid';

// import { type ObjectEvents, type FabricObject, type Line, type Group, Circle, type Rect, type Ellipse, type Triangle, type FabricObjectProps, type SerializedObjectProps } from 'fabric';
import {
  makeLine,
  makeCircle,
  CIRCLE_RADIUS,
  updateLinePosition,
} from './lineControl';
import type { ToolType } from '~/types/toolbar';

interface ObjectOptions {
  startPoints?: number[];
}

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
  moreOptions?: Partial<ObjectOptions>,
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
      if (moreOptions?.startPoints) {
        const [x1, y1] = moreOptions.startPoints;

        const line = makeLine([x1, y1, x1, y1]);
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
        canvas?.bringObjectToFront(endPoint);

        // if selected then show all points, if deselected then hide all points
        line.on('mousedown', () => {
          fabricSetting.setObjSetting('strokeWidth', line.strokeWidth, { temp: true });
          fabricSetting.setObjSetting('stroke', line.stroke as string, { temp: true });
          fabricSetting.setObjSetting('fill', line.fill as string, { temp: true });
          [firstPoint, endPoint].forEach((p) => {
            p.set('visible', true);
          });
        });

        line.on('selected', (e) => {
          [firstPoint, endPoint].forEach((p) => {
            p.set('visible', true);
          });
          updateLinePosition(e.target);
          console.log('se');
        });

        // if clicked outside of line then hide all points
        canvas?.on('mouse:down', function (e) {
          const target = e.target;
          if (!target) {
            [firstPoint, endPoint].forEach((p) => {
              p.set('visible', false);
            });
            canvas?.requestRenderAll();
          }
        });

        endPoint.set({
          updateLinePosition,
        });
        // asign points to line
        line.set({
          pointIds: [firstPoint.get('id'), endPoint.get('id')],
        });

        return endPoint;
      }
      else return makeLine([100, 100, 100, 100]);

    case 'line3':
      if (moreOptions?.startPoints) {
        const [x1, y1] = moreOptions.startPoints;

        const line = makeLine([x1, y1, x1, y1]);
        const line2 = makeLine([x1, y1, x1, y1]);
        const lineId = line.get('id');
        const lineId2 = line2.get('id');

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
        canvas?.bringObjectToFront(endPoint);

        // if selected then show all points, if deselected then hide all points
        [line, line2].forEach((l) => {
          // l.on('selected', () => {
          //   [firstPoint, midPoint, endPoint].forEach((p) => {
          //     p.set('visible', true);
          //   });
          // });
          l.on('mousedown', () => {
            [firstPoint, midPoint, endPoint].forEach((p) => {
              p.set('visible', true);
              canvas?.bringObjectToFront(p);
            });
          });
        });

        // if clicked outside of line then hide all points
        canvas?.on('mouse:down', function (e) {
          const target = e.target;

          console.log('mousedown', target);
          if (!target) {
            [firstPoint, midPoint, endPoint].forEach((p) => {
              p.set('visible', false);
            });
            canvas?.renderAll();
          }
        });

        const groupId = uuidv4();
        endPoint.set({
          groupId,
          updateLinePosition,
          midPointId: midPoint.get('id'),
          test: true,
          items: [line, line2, firstPoint, midPoint, endPoint],
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
        return endPoint;
      }
      else return new Line([0, 0, 0, 0], options);

    case 'triangle': {
      const triangle = new Triangle(options);
      triangle.on('selected', (o) => {
        fabricSetting.setObjSetting('strokeWidth', triangle.strokeWidth, { temp: true });
        fabricSetting.setObjSetting('stroke', triangle.stroke as string, { temp: true });
        fabricSetting.setObjSetting('fill', triangle.fill as string, { temp: true });
        o.target.perPixelTargetFind = false;
      });
      triangle.on('deselected', (o) => {
        o.target.perPixelTargetFind = true;
        fabricSetting.loadSettingFromLocalStorage();
      });
      return triangle;
    }

    case 'rect': {
      const rect = new Rect(options);
      rect.on('selected', (o) => {
        fabricSetting.setObjSetting('strokeWidth', rect.strokeWidth, { temp: true });
        fabricSetting.setObjSetting('stroke', rect.stroke as string, { temp: true });
        fabricSetting.setObjSetting('fill', rect.fill as string, { temp: true });
        o.target.perPixelTargetFind = false;
      });
      rect.on('deselected', (o) => {
        o.target.perPixelTargetFind = true;
        fabricSetting.loadSettingFromLocalStorage();
      });
      return rect;
    }

    case 'circle':
      return new Circle(options);

    case 'ellipse': {
      const ellipse = new Ellipse({
        ...options,
        rx: 0,
        ry: 0,
        fill: 'transparent',
        stroke: 'black',
      });
      ellipse.on('selected', (o) => {
        o.target.perPixelTargetFind = false;
      });
      ellipse.on('deselected', (o) => {
        o.target.perPixelTargetFind = true;
      });
      return ellipse;
    }

    case 'text': {
      const textbox = new Textbox('', {
        id: uuidv4(),
        fontSize: 40,
        top: option.top,
        left: option.left,
        editingBorderColor: 'transparent',
      });

      textbox.set(defaultObjectControl);
      textbox.on('deselected', () => {
        if (!textbox.text?.trim()) {
          canvas?.remove(textbox);
          canvas?.renderAll();
        }
      });

      // eslint-disable-next-line no-empty-character-class
      textbox._wordJoiners = /[]/;
      function fitTextboxToContent(textV: { target: IText }) {
        const text = textV.target;
        const textLinesMaxWidth = text.textLines.reduce(
          (max, _, i) => Math.max(max, text.getLineWidth(i)),
          0,
        );
        text.set({ width: textLinesMaxWidth });
      }

      canvas?.on('text:changed', fitTextboxToContent);
      return textbox;
    }

    default:
      return new Rect(options);
  }
}

// export function setupFabricMouseEvent(canvas: Canvas) {
//   canvas.on('mouse:wheel', function (opt) {
//     const delta = opt.e.deltaY;
//     let zoom = canvas.getZoom();
//     zoom *= 0.999 ** delta;
//     if (zoom > 20) zoom = 20;
//     if (zoom < 0.01) zoom = 0.01;
//     canvas.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), zoom);
//     opt.e.preventDefault();
//     opt.e.stopPropagation();
//   });

//   let isMouseDown = false;
//   let isDragging = false; // Track dragging state
//   let lastPosX: number, lastPosY: number; // Store last mouse positions
//   let startX: number, startY: number;
//   let fabricObj: FabricObject<Partial<FabricObjectProps>, SerializedObjectProps, ObjectEvents> | null = null;

//   const fabricStore = useFabricStore();
//   // Enable dragging when Shift key is pressed and mouse is down
//   canvas.on('mouse:down', function (opt) {
//     const evt = opt.e;
//     isMouseDown = true;
//     if (fabricStore.activeTool === 'move') {
//       canvas.selection = false; // Disable object selection
//       lastPosX = (evt as MouseEvent).clientX;
//       lastPosY = 'clientY' in evt ? evt.clientY : (evt as TouchEvent).touches[0].clientY;
//       // disable choose object
//       canvas.discardActiveObject();
//       canvas.forEachObject((obj) => {
//         console.log('Object', obj);
//         obj.selectable = false;
//         obj.evented = false;
//       });

//       // change cursor style to grabbing
//       canvas.renderAll();
//     }
//     else {
//       const pointer = canvas.getPointer(evt);
//       startX = pointer.x;
//       startY = pointer.y;
//       console.log('Start', startX, startY);
//       if (fabricStore.activeTool === 'triangle') {
//         fabricObj = new Rect({
//           width: 0,
//           height: 0,
//           fill: 'transparent',
//           stroke: 'black',
//           left: startX,
//           top: startY,
//         });

//         canvas.add(fabricObj);
//       }
//     }
//   });

//   // Handle dragging movement
//   canvas.on('mouse:move', function (opt) {
//     const fabricStore = useFabricStore();
//     const evt = opt.e;

//     if (isMouseDown) {
//       isDragging = true;
//     }

//     if (!isDragging) return;

//     if (fabricStore.activeTool === 'move') {
//       const vpt = canvas.viewportTransform;
//       if ('clientX' in evt) {
//         vpt[4] += evt.clientX - lastPosX; // Update horizontal translation
//         vpt[5] += evt.clientY - lastPosY; // Update vertical translation
//         lastPosX = evt.clientX;
//         lastPosY = evt.clientY;
//       }
//       else {
//         vpt[4] += evt.touches[0].clientX - lastPosX; // Update horizontal translation
//         vpt[5] += evt.touches[0].clientY - lastPosY; // Update vertical translation
//         lastPosX = evt.touches[0].clientX;
//         lastPosY = evt.touches[0].clientY;
//       }
//       canvas.requestRenderAll(); // Re-render the canvas
//       lastPosX = (evt as any).clientX;
//       lastPosY = (evt as any).clientY;
//     }

//     else {
//       canvas.selection = false; // Disable object selection
//       const pointer = canvas.getPointer(evt);
//       const width = pointer.x - startX;
//       const height = pointer.y - startY;

//       if (fabricObj && fabricStore.activeTool === 'triangle') {
//         fabricObj?.set({
//           width: Math.abs(width),
//           height: Math.abs(height),
//           left: width > 0 ? startX : startX - Math.abs(width),
//           top: height > 0 ? startY : startY - Math.abs(height),
//         });
//         canvas.renderAll();
//       }
//     }
//   });

//   // Stop dragging on mouse up
//   canvas.on('mouse:up', function () {
//     try {
//       canvas.selection = true; // Re-enable object selection
//       console.log('Mouse up', isDragging, fabricObj?.width, fabricObj?.height, (fabricObj && (fabricObj?.width < 20 || fabricObj?.height < 20)));
//       if (!isDragging && (fabricObj && (fabricObj.width < 2 || fabricObj.height < 2))) {
//         canvas.remove(fabricObj);
//         return;
//       }
//       if (isDragging) {
//         if (fabricStore.activeTool === 'triangle') {
//           canvas.setActiveObject(fabricObj);
//           fabricObj = null;
//         }

//         canvas.forEachObject((obj) => {
//           obj.selectable = true;
//           obj.evented = true;
//         });
//         canvas.renderAll();
//         fabricStore.setActiveTool('select');
//       }
//     }
//     catch (error) {
//       console.error(error);
//     }
//     finally {
//       isMouseDown = false;
//       isDragging = false;
//     }
//   });
// }
