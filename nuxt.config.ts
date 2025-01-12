// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    '@pinia/nuxt',
    'shadcn-nuxt',
  ],
  devtools: { enabled: true },
  app: {
    // buildAssetsDir: '_assets', // don't use "_" at the begining of the folder name to avoids nojkill conflict
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon-2.png' }],
    },
  },
  routeRules: {
    '/': {
      ssr: false,
    },
  },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        semi: true,
        quotes: 'single',
      },
    },
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
});
