import { iconsPlugin, getIconCollections } from '@egoist/tailwindcss-icons';

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts,tsx,js,jsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [
    iconsPlugin({
    // Select the icon collections you want to use
    // You can also ignore this option to automatically discover all individual icon packages you have installed
    // If you install @iconify/json, you should explicitly specify the collections you want to use, like this:
      collections: getIconCollections(['solar', 'lineicons', 'ph']),
    }),
  ],
};

export default config;
