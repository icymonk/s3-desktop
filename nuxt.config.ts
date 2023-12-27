// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  runtimeConfig: {
    app: {
      ...process.env,
    },
  },

  router: {
    options: {
      hashMode: true,
    },
  },

  modules: [
    'nuxt-electron',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
  ],

  electron: {
    build: [
      { entry: 'electron/main.ts' },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          args.reload()
        },
      },
    ],
    renderer: {},
  },

  i18n: {
    /* module options */
    defaultLocale: 'en',
    vueI18n: './i18n.config.ts',
    locales: ['en', 'ko'],
  },
})
