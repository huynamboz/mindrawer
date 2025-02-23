import type { FabricObject, Textbox } from 'fabric';
import { fitTextboxToContent } from './fabric/utils';
import type { ObjectSetting } from '~/types/editorSetting';

const mapFunction: { [key: string]: (o: FabricObject) => void } = {
  line: handleMouseDownLine,
  rect: handleMouseDownBaseShape,
  ellipse: handleMouseDownBaseShape,
  triangle: handleMouseDownBaseShape,
  textbox: handleMouseDownText,
};

export function assignEventToObj(target: FabricObject) {
  if (!target) return;

  console.log('mouse:down', target.type);
  if (mapFunction[target.type]) {
    mapFunction[target.type](target);
  }
}

function handleMouseDownLine(target: FabricObject) {
  const fabricStore = useFabricStore();
  target.on('mousedown', (o) => {
    if (!o.target) return;

    setObjPropertyToSetting(o.target, ['strokeWidth', 'stroke', 'fill']);
    const pointIds = o.target?.get('pointIds') as string[];

    console.log('pointIds', pointIds);
    if (!pointIds) return;

    const pointControls = pointIds.map(id => fabricStore.getObjectById(id));

    if (!pointControls) return;

    pointControls.forEach((point) => {
      point?.set('visible', true);
    });
  });
}

// rect, triangle, circle, ellipse
function handleMouseDownBaseShape(target: FabricObject) {
  const fabricSetting = useFabricSettingStore();
  target.on('selected', (o) => {
    setObjPropertyToSetting(o.target, ['strokeWidth', 'stroke', 'fill', 'strokeWidth']);
    o.target.perPixelTargetFind = false;
  });
  target.on('deselected', (o) => {
    o.target.perPixelTargetFind = true;
    fabricSetting.loadSettingFromLocalStorage();
  });

  target.on('scaling', function () {
    target.set({
      width: target.width * target.scaleX,
      height: target.height * target.scaleY,
      scaleX: 1,
      scaleY: 1,
    });
  });
}

function handleMouseDownText(target: FabricObject) {
  const canvas = useFabricStore().canvas;
  const fabricSetting = useFabricSettingStore();
  target.on('selected', (o) => {
    setObjPropertyToSetting(o.target, ['fill', 'stroke', 'fontSize', 'fontFamily']);
    fitTextboxToContent({ target: o.target });
  });

  target.on('resizing', () => {
    target.set('_wordJoiners', /[\s]/);
  });

  target.on('deselected', (o) => {
    fabricSetting.loadSettingFromLocalStorage();
    fitTextboxToContent({ target: o.target });
    if (!(o.target as Textbox).text?.trim()) {
      canvas?.remove(o.target);
      canvas?.renderAll();
    }
  });
}

function setObjPropertyToSetting(obj: FabricObject, key: string[]) {
  const fabricSetting = useFabricSettingStore();
  const currentKeyOfSetting = Object.keys(fabricSetting.objectSettings);
  key.forEach((k) => {
    if (currentKeyOfSetting.includes(k as string)) {
      fabricSetting.setObjSetting(k as keyof ObjectSetting, obj.get(k), { temp: true });
    }
  });
}

export function deselectAllPoint() {
  const fabricStore = useFabricStore();
  fabricStore.canvas?.getObjects().forEach((obj) => {
    if (obj.get('customType') === 'pointControl') {
      obj.set('visible', false);
      fabricStore.canvas?.requestRenderAll();
    }
  });
}
