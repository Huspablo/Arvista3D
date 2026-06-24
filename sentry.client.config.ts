import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Porcentaje de trazas de rendimiento que se capturan (1.0 = 100%)
  // Reducir en producción si el volumen es alto
  tracesSampleRate: 1.0,

  // Porcentaje de sesiones de replay que se capturan
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // No mostrar errores en consola durante desarrollo
  debug: false,
})
