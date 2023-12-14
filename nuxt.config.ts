// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  devtools: { enabled: false },

  runtimeConfig: {
    app: {
      ...process.env,
    },
  },

  modules: [
    'nuxt-electron',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],

  electron: {
    build: [
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          args.reload()
        },
      },
    ],
    renderer: {},
  },

  router: {
    options: {
      hashMode: true,
    },
  },

  // vite: {
  // plugins: [nodePolyfills()],
  // vue: {
  //   script: {
  //     fs: {
  //       fileExists(file: string) {
  //         return existsSync(file)
  //       },
  //       readFile(file: string) {
  //         return readFileSync(file, 'utf-8')
  //       },
  //     },
  //   },
  // },
  // },
})
