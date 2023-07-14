// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/supabase", "@vite-pwa/nuxt"],
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [
        { rel: "stylesheet", href: "/index.css" },
        { rel: "icon", type: "image/png", href: "/logo-ct-sm.png" },
      ],
      script: [
        {
          "data-goatcounter": "https://clocktracker.goatcounter.com/count",
          async: true,
          src: "//gc.zgo.at/count.js",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      sentryDsn: process.env.SENTRY_DSN,
    },
  },
  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["/img/**", "/logo-ct-sm.png", "logo.png"],
    manifest: {
      name: "ClockTracker",
      short_name: "ClockTracker",
      description: "Record your game details from Blood on the Clocktower",
      theme_color: "#1C1917",
      icons: [
        {
          src: "pwa-128.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-128.png",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
  },
});
