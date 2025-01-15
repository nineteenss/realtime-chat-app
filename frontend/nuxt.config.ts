// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  ssr: true,

  css: ["~/assets/css/tailwind.css"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4005',
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    }
  },

  modules: [
    "@pinia/nuxt",
    ["pinia-plugin-persistedstate/nuxt", { clientOnly: true }],
    "@nuxtjs/tailwindcss",
    "@nuxt/icon"
  ],

  pinia: {
    storesDirs: ['./stores/**']
  },

  // imports: {
  //   dirs: ["stores"],
  // },

  // pinia: {
  //   autoImports: [
  //     "defineStore", // Auto-import `defineStore`
  //     "storeToRefs", // Auto-import `storeToRefs`
  //   ],
  // }
})