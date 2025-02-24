import { FabricObject } from 'fabric';
import { getAdditionalObjectKey } from '~/utils/fabric';

export const useFabricHistoryStore = defineStore('fabric-history', () => {
  const historyUndo = ref<string[]>([]);
  const historyNextState = ref<string>('');
  const historyProcessing = ref(false);
  const historyIndex = ref(0);

  function historyInit() {
    const fabricStore = useFabricStore();
    const canvas = fabricStore.canvas;
    if (!canvas) return;

    historyNextState.value = historyNext();
    historyUndo.value.push(historyNextState.value);
    canvas.on({
      'object:removed': historySaveAction,
      'object:modified': historySaveAction,
    });
  }

  function clearAfterIndex() {
    historyUndo.value = historyUndo.value.splice(0, historyIndex.value + 1);
  }

  function historySaveAction() {
    const fabricStore = useFabricStore();
    const canvas = fabricStore.canvas;
    if (!canvas) return;

    if (historyProcessing.value)
      return;

    historyNextState.value = historyNext();
    historyUndo.value.push(historyNextState.value);
    historyIndex.value = historyUndo.value.length - 1;

    const objects = canvas.getObjects().map((o) => {
      if (o.type === 'image') {
        o.set('src', '');
        console.log('object', o.toObject());
      }
      return { ...o.toObject(getAdditionalObjectKey()), src: '' };
    });
    const objectsJSON = JSON.stringify(objects);
    localStorage.setItem('canvas-objects', objectsJSON);
    localStorage.setItem('canvas', JSON.stringify(canvas.toDatalessJSON(getAdditionalObjectKey())));
  }

  function historyNext() {
    const fabricStore = useFabricStore();
    const canvas = fabricStore.canvas;
    if (!canvas) return '';

    // set excludeFromExport to false before saving the history
    canvas.getObjects().forEach((o) => {
      if (o instanceof FabricObject) {
        o.excludeFromExport = false;
      }
    });
    const json = JSON.stringify(canvas.toDatalessJSON(getAdditionalObjectKey()));
    // set excludeFromExport back to true
    canvas.getObjects().forEach((o) => {
      if (o instanceof FabricObject) {
        o.excludeFromExport = true;
      }
    });
    return json;
  }

  async function redo() {
    const fabricStore = useFabricStore();
    const canvas = fabricStore.canvas;
    if (!canvas) return;
    // The redo process will render the new states of the objects
    // Therefore, object:added and object:modified events will triggered again
    // To ignore those events, we are setting a flag.
    if (historyIndex.value < historyUndo.value.length - 1) {
      console.log('redo', historyIndex.value, historyUndo.value.length);
      ++historyIndex.value;
    }
    historyProcessing.value = true;

    const history = historyUndo.value[historyIndex.value];
    if (history) {
      await canvas.loadFromJSON(history, (o, obj) => {
        if (obj && obj instanceof FabricObject) {
          assignEventToObj(obj);
          canvas.requestRenderAll();
        }
      });
      canvas.requestRenderAll();
    }

    historyProcessing.value = false;
  }
  async function undo() {
    const fabricStore = useFabricStore();
    const canvas = fabricStore.canvas;
    if (!canvas) return;

    if (historyIndex.value > 0) {
      --historyIndex.value;
    }
    // The undo process will render the new states of the objects
    // Therefore, object:added and object:modified events will triggered again
    // To ignore those events, we are setting a flag.
    historyProcessing.value = true;

    const history = historyUndo.value[historyIndex.value];
    if (history) {
      await canvas.loadFromJSON(history, (o, obj) => {
        if (obj && obj instanceof FabricObject) {
          assignEventToObj(obj);
          canvas.requestRenderAll();
        }
      });
    }

    historyProcessing.value = false;
  }
  return {
    redo,
    undo,
    historyInit,
    historySaveAction,
    clearAfterIndex,
    historyUndo,
    historyNextState,
    historyProcessing,
    historyIndex,
  };
});
