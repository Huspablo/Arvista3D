# Arvista 3D — Stack tecnológico canónico

## Objetivo de este documento
Este documento define el stack tecnológico recomendado para **Arvista 3D** de forma **clara, estable y fácil de interpretar por una IA**. Debe usarse como referencia principal para tomar decisiones técnicas y mantener coherencia durante el desarrollo.

## Principios de decisión
- **Estética premium y limpia** por encima de la complejidad visual.
- **Carga rápida y navegación fluida** en web pública.
- **3D real en navegador** como experiencia principal.
- **Backoffice simple para artistas** y pipeline robusto para assets.
- **Escalabilidad progresiva** sin sobrediseñar la primera versión.
- **Configuración controlada** en lugar de libertad total de edición 3D.

---

## Stack canónico por capa

### 1. Plataforma web principal
**Tecnología elegida:** `Next.js (App Router) + React + TypeScript`

**Cómo se usa**
- Next.js se usa como base de la aplicación web pública y privada.
- React se usa para toda la interfaz de usuario.
- TypeScript se usa en todo el proyecto para mantener tipos consistentes entre frontend, backend y dominio.

**Por qué se elige**
- Permite construir una aplicación web moderna con rutas públicas, dashboard privado y backend integrado sin separar proyectos desde el inicio.
- Reduce complejidad operativa en la primera fase.
- Encaja muy bien con componentes interactivos, estado local y una experiencia web premium.

**Decisión práctica**
- Un único repositorio y una única aplicación web para MVP y v1.
- No separar frontend y backend en proyectos distintos al inicio.

---

### 2. Motor de visualización de galerías
**Tecnología elegida:** `Three.js + React Three Fiber + Drei`

**Cómo se usa**
- Three.js es el motor gráfico 3D principal.
- React Three Fiber se usa como capa declarativa para integrar el 3D dentro de React.
- Drei se usa para utilidades listas para producción: controles, loaders, helpers y componentes comunes.

**Por qué se elige**
- Es la mejor combinación para una experiencia **3D real en web** con buena integración en una aplicación React.
- Permite una estética minimalista y cuidada sin depender de streaming remoto.
- Facilita reutilizar escenas, materiales y plantillas de galería dentro de una arquitectura de producto.

**Decisión práctica**
- La galería virtual se renderiza en el navegador.
- No usar pixel streaming como experiencia principal.
- No usar 2.5D como experiencia principal; solo como posible fallback futuro.

---

### 3. Formato de assets 3D e imágenes
**Tecnología elegida:**
- `GLB/GLTF` para modelos 3D
- `JPG / PNG / WebP` para imagen maestra y derivados
- `Draco / Meshopt / KTX2` para optimización de assets 3D cuando aplique

**Cómo se usa**
- GLB será el formato 3D preferido para runtime.
- Las imágenes originales se almacenan como master y se derivan a versiones optimizadas para sala, miniatura y detalle.
- Las texturas y modelos se sirven ya optimizados para web.

**Por qué se elige**
- GLB es el formato más adecuado para cargar modelos 3D en web de forma consistente.
- Separar original y derivados permite mantener calidad y rendimiento al mismo tiempo.
- Las optimizaciones de geometría y texturas reducen tiempos de carga y consumo de GPU.

**Decisión práctica**
- Todo asset debe tener una versión preparada para visualización web.
- No renderizar assets pesados “tal cual” fueron subidos por el artista.

---

### 4. Interfaz de usuario 2D
**Tecnología elegida:** `Tailwind CSS + componentes UI propios`

**Cómo se usa**
- Tailwind se usa para construir la interfaz de dashboard, formularios, paneles de detalle, tooltips y navegación general.
- Los componentes UI clave se definen como librería interna del proyecto para mantener consistencia visual.

**Por qué se elige**
- Permite construir una interfaz sobria, limpia y rápida de iterar.
- Facilita crear un lenguaje visual propio sin arrastrar estilos pesados de librerías genéricas.
- Es adecuado para un producto donde el diseño debe sentirse editorial y premium.

**Decisión práctica**
- Evitar frameworks UI excesivamente opinionados para el front principal.
- La identidad visual debe salir del sistema de diseño del producto, no de una librería de componentes externa.

---

### 5. Estado del cliente y datos remotos
**Tecnología elegida:**
- `useState` / `useRef` para estado UI/local del viewer
- `TanStack Query` para datos remotos y caché cliente

**Cómo se usa**
- El viewer 3D gestiona su estado (parámetros de escena, obra seleccionada, cámara) con `useState` y `useRef` locales — suficiente para la complejidad actual.
- TanStack Query gestiona lecturas remotas, caché, refetch y sincronización de datos de galerías, obras y perfil en el dashboard.

**Por qué se elige**
- `useState` es suficiente para el viewer actual y evita añadir una dependencia innecesaria.
- TanStack Query separa estado remoto de estado local y gestiona loading/error states de forma robusta.

**Decisión práctica**
- **Zustand no se usa** — evaluado y descartado: el viewer actual no tiene suficiente estado compartido entre componentes para justificarlo.
- No usar Redux para el MVP.
- Si el viewer crece en complejidad, reevaluar Zustand en ese momento.

---

### 6. Backend de aplicación
**Tecnología elegida:** `Next.js Route Handlers + capa de servicios interna`

**Cómo se usa**
- Los endpoints del producto se implementan dentro del mismo proyecto Next.js.
- La lógica de negocio no vive en los componentes; vive en servicios internos reutilizables.
- El backend expone operaciones para artistas, galerías, obras, publicación, suscripciones y manifests de galería.

**Por qué se elige**
- Simplifica la arquitectura inicial.
- Permite evolucionar rápido sin mantener dos aplicaciones separadas.
- Es suficiente para un MVP sólido y una v1 con tráfico real.

**Decisión práctica**
- No crear microservicios al inicio.
- Separar por módulos de dominio: auth, artists, galleries, artworks, subscriptions, assets, manifests.

---

### 7. Procesamiento asíncrono y workflows
**Tecnología elegida:** `Inngest`

**Cómo se usa**
- Se usa para procesar tareas asíncronas y durables:
  - generación de derivados de imagen,
  - validación y normalización de modelos 3D,
  - generación de thumbnails,
  - reconstrucción de manifests,
  - tareas reintentables tras subida o publicación.

**Por qué se elige**
- Evita montar infraestructura de colas y workers desde el inicio.
- Encaja muy bien con aplicaciones Next.js.
- Permite dividir pipelines largos en pasos con reintentos y observabilidad.

**Decisión práctica**
- Todas las tareas pesadas o lentas salen del request principal.
- Subir una obra no debe bloquear la UI mientras se procesan derivados.
- En fases iniciales de desarrollo, los jobs pueden ejecutarse de forma síncrona como paso intermedio antes de activar Inngest. La interfaz de llamada no cambia.

---

### 8. Base de datos principal
**Tecnología elegida:** `PostgreSQL`

**Cómo se usa**
- PostgreSQL almacena artistas, galerías, obras, suscripciones, asignaciones, estados y configuración curatorial.
- Los campos de configuración flexible se guardan como JSONB cuando tenga sentido.

**Por qué se elige**
- Es una base sólida para relaciones claras entre artista, galería, obra y plan.
- Permite combinar modelo relacional estricto con configuraciones flexibles.
- Es adecuada para reglas de negocio, auditoría y evolución del dominio.

**Decisión práctica**
- Modelo relacional como base.
- JSONB solo para configuración visual, layout y overrides controlados.

---

### 9. ORM y acceso a datos
**Tecnología elegida:** `Prisma ORM`

**Cómo se usa**
- Prisma define el esquema del dominio, genera el cliente tipado y gestiona migraciones.
- Se usa como capa principal de acceso a PostgreSQL.

**Por qué se elige**
- Acelera desarrollo en TypeScript.
- Mantiene tipado consistente entre aplicación y base de datos.
- Mejora claridad del dominio y velocidad de iteración.

**Decisión práctica**
- Prisma como único ORM del proyecto.
- No mezclar varios enfoques de acceso a datos.

---

### 10. Autenticación y gestión de cuentas
**Tecnología elegida:** `Clerk`

**Cómo se usa**
- Clerk se usa para registro, login, sesión, protección de rutas y gestión básica de cuenta.
- El dominio del producto mantiene su propio modelo de artista, enlazado con la identidad autenticada.

**Por qué se elige**
- Reduce mucho el tiempo de implementación de autenticación.
- Está bien integrado con aplicaciones Next.js.
- Permite centrar el esfuerzo en la lógica de galerías y artworks en lugar de reconstruir auth desde cero.

**Decisión práctica**
- Identity gestionada por Clerk.
- Perfil y reglas de negocio gestionados por la aplicación.

---

### 11. Suscripciones y pagos
**Tecnología elegida:** `Stripe Billing`

**Cómo se usa**
- Stripe gestiona productos, precios, suscripciones, renovaciones, cambios de plan y webhooks de facturación.
- La aplicación sincroniza el estado de suscripción para aplicar límites de negocio.

**Por qué se elige**
- Resuelve de forma estándar la lógica de suscripción recurrente.
- Permite crecer desde planes simples a modelos más complejos si el producto evoluciona.
- Reduce riesgo en una parte sensible del negocio.

**Decisión práctica**
- Stripe es la fuente de verdad de cobro.
- La aplicación es la fuente de verdad de límites efectivos y permisos de uso.

---

### 12. Almacenamiento de assets y distribución global
**Tecnología elegida:** `Cloudflare R2 + Cloudflare CDN`

**Cómo se usa**
- R2 almacena originales y derivados de imágenes, modelos 3D, posters, thumbnails y recursos públicos/privados.
- Las subidas se hacen mediante URLs prefirmadas (API compatible con S3).
- Para archivos pesados se usa multipart upload.
- La CDN de Cloudflare sirve los assets globalmente sin configuración adicional.
- El acceso a contenido privado se controla mediante signed URLs.

**Por qué se elige frente a S3 + CloudFront**
- API 100% compatible con S3: el código de subida es idéntico.
- Sin coste de egress (CloudFront cobra por transferencia saliente; R2 no).
- CDN incluida sin configuración separada de distribución.
- Menor fricción operativa: no requiere gestión de IAM, políticas de bucket complejas ni distribuciones independientes.
- Escala globalmente con la misma garantía de durabilidad.

**Decisión práctica**
- Los assets no pasan por el servidor de aplicación como proxy de subida.
- Originales y derivados se almacenan separados.
- Todo asset público o derivado optimizado se sirve desde CDN.
- No servir medios pesados directamente desde el servidor de aplicación.

---

### 13. Procesamiento de imagen
**Tecnología elegida:** `Sharp`

**Cómo se usa**
- Sharp genera thumbnails, versiones optimizadas de sala, recortes y derivados de alta densidad para zoom o detalle.

**Por qué se elige**
- Es rápido, estable y adecuado para pipelines de imagen en Node.js.
- Permite controlar tamaños y calidades de forma precisa.

**Decisión práctica**
- Cada imagen subida genera automáticamente derivados estándar.
- Nunca servir la imagen original como recurso por defecto dentro de la galería.

---

### 14. Observabilidad y errores
**Tecnología elegida:** `Sentry`

**Cómo se usa**
- Sentry captura errores del frontend, backend y viewer.
- Se usa para detectar problemas de carga de assets, fallos en render y errores de publicación.

**Por qué se elige**
- En una experiencia 3D pública, los errores deben detectarse rápido.
- Ayuda a depurar errores difíciles ligados a dispositivo, navegador o asset concreto.

**Decisión práctica**
- Toda operación crítica debe registrar errores trazables.
- El viewer debe tener fallbacks limpios cuando falle un asset.

---

### 15. Testing
**Tecnología elegida:** `Vitest`

**Cómo se usa**
- Vitest ejecuta tests unitarios de servicios e integración de Route Handlers.
- Prisma se mockea con `vi.hoisted()` para aislar la lógica de negocio de la BD.
- Clerk y `next/cache` se mockean en todos los tests.

**Por qué se elige frente a Jest**
- TypeScript nativo sin configuración extra.
- Compatible con el ecosistema Next.js App Router y los alias `@/`.
- 10-20× más rápido que Jest en este tipo de proyecto.

**Decisión práctica**
- Tests unitarios para servicios críticos de dominio (`publishArtwork`, `assertGalleryQuota`, `buildManifest`).
- Tests de integración para Route Handlers (validación Zod, códigos HTTP).
- No testear componentes React ni el viewer 3D — ROI bajo, cambian frecuentemente.
- Tests E2E con Playwright: opcional, recomendado antes del primer deploy a producción.

---

## Modelo técnico de galerías

### Enfoque recomendado
**Plantillas curatoriales + overrides controlados**

**Cómo funciona**
- Cada galería nace desde una plantilla base.
- La plantilla define geometría, slots, iluminación y materiales base.
- El artista solo personaliza variables permitidas: muros, suelo, luz, marcos, pedestales, densidad y portada.

**Por qué se elige**
- Mantiene una estética premium coherente.
- Reduce complejidad técnica y errores de composición.
- Hace posible renderizar la galería desde datos semánticos en lugar de escenas arbitrarias.

**Decisión práctica**
- No ofrecer un editor 3D libre en la primera versión.
- La personalización siempre debe estar limitada por presets y validaciones.

---

## Modelo técnico de artworks

### Flujo recomendado
**Upload directo + procesamiento asíncrono + publicación explícita**

**Cómo funciona**
1. El artista sube uno o varios archivos.
2. El sistema crea registros en estado borrador.
3. Los assets se procesan en segundo plano.
4. El artista completa metadatos.
5. El artista asigna la obra a una galería.
6. La publicación valida capacidad, compatibilidad y slot.
7. El manifest de galería se regenera.

**Por qué se elige**
- Hace el flujo de artista más claro.
- Evita bloquear la interfaz.
- Separa ingesta, procesado y publicación como estados de negocio distintos.

---

### Pipeline por tipo de obra

El tipo de obra determina el pipeline de procesamiento y la forma de representación en el viewer. Esta distinción debe existir en el dominio, no solo en la capa gráfica.

| Tipo | Asset principal | Representación en galería | Pipeline |
|---|---|---|---|
| Pintura / Fotografía | Imagen (JPG/PNG/WebP) | Plano con textura sobre la pared | Sharp genera derivados: thumbnail, sala, detalle |
| Escultura | Modelo 3D (GLB/GLTF) | Modelo posicionado en pedestal | Validación + compresión Draco/Meshopt |
| Otro | Imagen o modelo según caso | Plano o modelo según asset | Se determina al subir |

**Regla crítica:** el manifest de galería debe incluir el tipo de obra y el modo de representación (`wall_plane` o `floor_model`) para cada slot. El viewer no debe inferir la representación desde el tipo; debe leerla del manifest. Esto desacopla dominio y renderizado.

---

## Modelo técnico de renderizado

### Fuente de verdad del viewer
**Gallery Manifest**

**Cómo funciona**
- El backend entrega un manifest semántico de galería, no una escena arbitraria guardada manualmente.
- El manifest contiene:
  - plantilla,
  - configuración visual,
  - slots activos,
  - obras publicadas,
  - asignación slot ↔ obra,
  - recursos derivados listos para render.

**Por qué se elige**
- Hace la escena reproducible y cacheable.
- Facilita re-render, depuración y evolución del producto.
- Permite cambiar la presentación sin romper el dominio.

---

## Stack resumido

| Capa | Stack elegido | Motivo principal |
|---|---|---|
| Plataforma web | Next.js + React + TypeScript | Base full-stack moderna y coherente |
| Viewer 3D | Three.js + React Three Fiber + Drei | 3D real en web con buena DX |
| UI 2D | Tailwind CSS + componentes propios | Estética limpia y controlada |
| Estado local | `useState` / `useRef` | Zustand descartado — no necesario para el viewer actual |
| Datos remotos | TanStack Query | Caché y sincronización robusta |
| Backend | Next Route Handlers + servicios | Menor complejidad inicial |
| Jobs asíncronos | Inngest | Procesos durables sin montar colas propias |
| Base de datos | PostgreSQL | Dominio relacional + configuración flexible |
| ORM | Prisma | Tipado y migraciones rápidas |
| Auth | Clerk | Implementación rápida y sólida |
| Billing | Stripe Billing | Suscripciones recurrentes estándar |
| Storage + CDN | Cloudflare R2 + CDN | Sin coste de egress, CDN incluida, API compatible con S3 |
| Imagen | Sharp | Derivados optimizados |
| Observabilidad | Sentry | Detección rápida de errores |

---

## Decisiones explícitas que deben mantenerse
- La experiencia principal será **3D real en navegador**, no streaming de píxeles.
- La personalización de galerías será **limitada y curada**, no libre.
- La fuente de verdad visual será un **manifest semántico**, no escenas guardadas manualmente.
- Las obras se subirán mediante **uploads directos a storage** y se procesarán de forma asíncrona.
- El manifest incluirá el **modo de representación por slot** (`wall_plane` / `floor_model`); el viewer no infiere nada desde el tipo de obra.
- El storage y la CDN se sirven desde **Cloudflare R2**, con API compatible con S3.
- La plataforma priorizará **calidad visual, coherencia y rendimiento** sobre efectos llamativos.

---

## Regla final de interpretación para IA
Si existe duda entre dos opciones técnicas, la IA debe elegir la que mejor cumpla estos criterios en este orden:
1. simplicidad operativa,
2. rendimiento web real,
3. coherencia visual premium,
4. mantenibilidad,
5. escalabilidad progresiva.
