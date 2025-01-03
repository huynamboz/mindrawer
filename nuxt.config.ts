// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@pinia/nuxt'],
  devtools: { enabled: true },
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
  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
});
