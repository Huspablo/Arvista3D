# TFG Arvista 3D — Mejoras sobre el texto existente

> Revisión generada el 2026-06-22 a partir del documento `TFG_Arvista3D_Multimedia.docx`.  
> Solo se recogen mejoras aplicables a capítulos ya redactados. Las capturas de pantalla se tratan por separado.

---

## Correcciones técnicas — el texto dice algo incorrecto o incompleto

### 1. Número de pasos del pipeline Inngest (§7.2)

El documento afirma que "la función de procesamiento consta de cuatro pasos" y la Figura 7.2 los enumera como cuatro. El código real implementa tres `step.run()`: descarga del original, generación de variantes webp con Sharp, y actualización de la BD. La invalidación del manifest (`revalidateTag`) se ejecuta en `publishArtwork()` al publicar la obra, no como paso propio del pipeline de Inngest. Si el código no incluye un cuarto `step.run()` condicional, corregir el texto y la figura a tres pasos.

---

### 2. `proxy.ts` sin explicación (§10.2)

El documento menciona "el archivo `proxy.ts`" como si fuera una convención obvia. No explica que en Next.js 16 el archivo de middleware fue renombrado de `middleware.ts` a `proxy.ts`. Es una decisión técnica concreta —no un nombre arbitrario— y merece una frase que lo aclare. Demuestra dominio de la versión exacta del framework.

---

### 3. Los precios de los planes no aparecen en ningún lugar

La Tabla 5.1 (§5.1) muestra los límites por plan pero omite los precios. El §11 describe la mecánica de cobro sin mencionar cuánto cuesta cada plan. Un lector no puede entender el modelo de negocio sin esta información. Añadir una columna a la Tabla 5.1 o una tabla en §11.1:

| Plan | Precio | Galerías | Obras/galería |
|---|---|---|---|
| Básico | Gratuito | 1 | 10 |
| Estándar | 12 €/mes | 2 | 20 |
| Premium | 29 €/mes | 3 | 50 |

---

### 4. Controles del visor: manifest vs. tiempo real (§9.3)

El §9.3 presenta `wallColor`, `floorMaterial` y `lightingPreset` como los únicos parámetros visuales, procedentes del manifest. El visor tiene además un panel colapsable con controles en tiempo real —intensidades de luz, exposición, niebla— que no se persisten y no afectan al manifest. Sin esta distinción, el lector entiende que toda la configuración visual es permanente y viene del backend. Añadir un párrafo que separe explícitamente ambos ámbitos.

---

### 5. `viewCount` referenciado solo como contador, sin conectar con la landing (§4.3)

El §4.3 presenta `viewCount` como "contador de popularidad que se incrementa en el servidor". No menciona que la landing page es un Server Component que ordena las obras por `viewCount desc` con límite 6. Es el único punto del sistema donde el comportamiento del visitante retroalimenta la presentación pública — darle contexto en §4.3 o en el recorrido de §12.2 completa la imagen del dato.

---

### 6. El Listado 4.1 omite campos sin decirlo con claridad (§4.2)

El documento dice "de forma resumida" pero no especifica qué se omite. El lector no sabe si está viendo el esquema completo o un subconjunto. Los campos ausentes son relevantes: `avatarUrl`, `website`, `bio` en `Artist`; `year`, `technique`, `description`, `edition`, `dimWidth`, `dimHeight`, `dimDepth` en `Artwork`. Añadir una nota explícita indicando qué campos se han suprimido del listado y por qué (para centrarse en los campos que expresan las reglas de negocio).

---

## Mejoras de profundidad — secciones existentes que quedan cortas

### 7. Estado del arte demasiado acotado (Cap. 2)

La Tabla 2.1 compara cuatro plataformas. Para el nivel esperado en un TFG de Multimedia:

- Ampliar a 6–8 plataformas: Mozilla Hubs, Spatial.io y Sketchfab son opciones directamente comparables que la tabla ignora.
- Citar algún trabajo académico sobre *virtual museum experience* — hay bibliografía desde los 2000s que justificaría académicamente la motivación del proyecto.
- Mencionar WebXR como evolución del estándar WebGL; no adoptar WebXR es una decisión que merece una línea de justificación.

---

### 8. §15.2 "Decisiones de compromiso" en forma narrativa

El §15.2 discute las decisiones técnicas en párrafos. La misma información en formato de tabla (decisión / alternativa descartada / razón) sería más clara, más escaneable y más habitual en memorias de ingeniería. Las elecciones ya están descritas; solo se trata de reformatearlas:

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Next.js monolítico | Microservicios | Menor complejidad operativa para MVP |
| `unstable_cache` | Redis / Vercel KV | Sin infraestructura adicional |
| Cloudflare R2 | AWS S3 + CloudFront | Sin coste de egress; CDN incluida |
| Inngest | BullMQ / SQS | Sin gestión de colas propia |
| Clerk | Auth.js / Supabase Auth | Integración nativa con Next.js |
| Stripe | Paddle / Lemon Squeezy | Webhooks confiables; estándar del sector |
| Vitest | Jest | TypeScript nativo; ejecución notablemente más rápida |
| Prisma | Drizzle / TypeORM | Migraciones automáticas; cliente tipado generado |
| `useState` en viewer | Zustand | Suficiente para la complejidad actual |
| Upload directo a R2 | Upload a través del servidor | El servidor no actúa como proxy |

---

### 9. Cap. 14 describe qué se prueba pero no muestra cómo

El capítulo indica los casos cubiertos sin incluir ningún fragmento de código. Añadir un listado con el test más representativo —por ejemplo, el caso de publicación con obra ajena o capacidad llena— ilustraría el patrón `vi.hoisted()` y haría tangible la estrategia descrita. Un extracto de 20–30 líneas sería suficiente.

---

### 10. §15.3 lista líneas futuras pero no limitaciones actuales

El §15.3 habla de lo que se puede añadir, pero no distingue entre extensiones deseables y limitaciones del sistema en su estado actual. Declarar las limitaciones conocidas es señal de madurez técnica e impide que el tribunal las detecte como omisiones. Las principales:

- El feed de actividad del dashboard muestra datos ficticios; requiere una nueva tabla de eventos en el esquema.
- No existe pantalla de edición completa de galería (solo el toggle de visibilidad desde el listado).
- La cobertura de pruebas se limita a la capa de dominio; no hay tests E2E.
- La plantilla de sala es única (`white-cube-8`); las otras dos opciones del selector no están disponibles.

Se puede añadir como una subsección "15.x Limitaciones del sistema actual" antes de §15.3, o integrar la información al inicio de §15.3 antes de las líneas futuras.
