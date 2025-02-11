import { Notify } from "quasar";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    'nuxt-quasar-ui',
    'pinia-plugin-persistedstate/nuxt',
    '@i2d/nuxt-pdf-frame'
  ],
  quasar: {
    plugins: [
      'Notify',
    ]
  }
})