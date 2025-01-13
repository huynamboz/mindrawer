import type { EditorSetting, ObjectSetting } from '~/types/editorSetting';
import { updateLinePosition } from '~/utils/fabric/lineControl';

const MAX_RECENT_COLOR = 5;
const defaultRecentColors = ['#f37655', '#3a95c9', '#ee2624', '#2cb656', '#2c83c6'];

export interface SettingMoreOptions {
  temp: boolean;
}
export const useFabricSettingStore = defineStore('fabric-settings', () => {
  const objectSettings = ref<ObjectSetting>({
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 1,
    strokeDashArray: [],
    opacity: 1,
  });

  const editorSettings = ref<EditorSetting>({
    theme: 'light',
    grid: false,
    gridColor: '#000000',
    gridSize: 10,
    gridSizeUnit: 'px',
    gridSizeUnitOptions: ['px', 'cm', 'mm', 'in'],

    recentFillColors: [],
    recentStrokeColors: [],
  });

  // load from local storage
  console.log('load from local storage', objectSettings.value);
  function loadSettingFromLocalStorage() {
    const localSettings = localStorage.getItem('editor-settings');
    if (localSettings) {
      const { objSetting, editorSetting } = JSON.parse(localSettings);
      objectSettings.value = objSetting;
      editorSettings.value = editorSetting;
    }
  }

  onBeforeMount(() => {
    loadSettingFromLocalStorage();
    updateRecentColorFromLocal('recentFillColors');
    updateRecentColorFromLocal('recentStrokeColors');
  });

  async function updateRecentColorFromLocal(historyKey: 'recentFillColors' | 'recentStrokeColors') {
    await nextTick();
    const historyColorsSaved = localStorage.getItem(historyKey);

    if (historyColorsSaved) {
      // lấy MAX_RECENT_COLOR màu gần đây
      const savedColors = JSON.parse(historyColorsSaved).slice(0, MAX_RECENT_COLOR);
      if (historyColorsSaved.length > MAX_RECENT_COLOR) {
        localStorage.setItem(historyKey, JSON.stringify(savedColors));
      }
      setEditorSetting(historyKey, JSON.parse(historyColorsSaved).slice(0, MAX_RECENT_COLOR));
    }
    else {
      console.log('set default recent colors');
      setEditorSetting(historyKey, defaultRecentColors);
    }
  }

  function saveSettingToLocalStorage() {
    localStorage.setItem('editor-settings', JSON.stringify({
      objSetting: objectSettings.value,
      editorSetting: editorSettings.value,
    }));
  }

  function setEditorSetting<K extends keyof EditorSetting>(
    key: K,
    value: EditorSetting[K],
    option: SettingMoreOptions = { temp: false },
  ) {
    editorSettings.value[key] = value;

    if (option.temp) return;
    saveSettingToLocalStorage();
  }

  function setObjSetting<K extends keyof ObjectSetting>(
    key: K,
    value: ObjectSetting[K],
    option: SettingMoreOptions = { temp: false },
  ) {
    objectSettings.value[key] = value;

    if (!option.temp) {
      saveSettingToLocalStorage();
    }
    else {
      return;
    }

    const fabricStore = useFabricStore();
    const canvas = fabricStore.canvas;
    if (!canvas) return;

    // save to local storage
    const objectActive = canvas.getActiveObject();

    console.log('set', objectActive);
    if (objectActive) {
      // objectActive?.set(key, value);
      const lineIds = objectActive.get('lineIds') as string[];
      if (lineIds) {
        lineIds.forEach((id) => {
          const line = fabricStore.getObjectById(id);
          if (line) {
            line.set(key, value);
            updateLinePosition(line);
            line.setCoords();
          }
        });
      }
      else {
        objectActive.set(key, value);
      }
      objectActive.setCoords();
      canvas.requestRenderAll();
    }
  }

  function getObjSetting<K extends keyof ObjectSetting>(key: K): ObjectSetting[K] {
    return objectSettings.value[key];
  }

  function getEditorSetting<K extends keyof EditorSetting>(key: K): EditorSetting[K] {
    return editorSettings.value[key];
  }

  return {
    editorSettings,
    objectSettings,
    setEditorSetting,
    getEditorSetting,
    setObjSetting,
    getObjSetting,
    updateRecentColorFromLocal,
    loadSettingFromLocalStorage,
  };
});
