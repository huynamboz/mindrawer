import type { EditorSetting } from '~/types/editorSetting';

export const useEditorStore = defineStore('editor-settings', () => {
  const settings = ref<EditorSetting>({
    theme: 'light',
    grid: false,
    gridColor: '#000000',
    gridSize: 10,
    gridSizeUnit: 'px',
    gridSizeUnitOptions: ['px', 'cm', 'mm', 'in'],

    // Object setting
    fill: '#000000',
    recentFillColors: ['#000000'],
    stroke: '#000000',
    recentStrokeColors: ['#000000'],
    strokeWidth: 1,
    strokeDashArray: [],
    opacity: 100,
  });

  function setSetting<K extends keyof EditorSetting>(
    key: K,
    value: EditorSetting[K],
  ) {
    settings.value[key] = value;
  }

  return {
    settings,
    setSetting,
  };
});
