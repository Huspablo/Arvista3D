# VISUAL_AUDIT.md
> Auditoría visual y de experiencia de usuario — Arvista 3D
> Fecha: junio 2026 · Solo análisis, sin cambios de código

---

## 1. Resumen general

Arvista 3D tiene una identidad visual clara y deliberada: tipografía serif (Cormorant), paleta neutras cálidas con acento en gold/oklch, bordes finos, esquinas sin redondear, espaciados generosos y animaciones de entrada cuidadas. El look es editorial y sofisticado — coherente con una plataforma de arte premium.

**Fortalezas globales:**
- El hero de la landing es de alta calidad: parallax, contadores animados, marcos flotantes, SVG grid de fondo.
- Las cards de obra en `/dashboard/artworks` tienen efecto 3D-tilt en hover bien ejecutado.
- El formulario de nueva galería (split layout + previsualización SVG perspectiva) es notable.
- El viewer 3D tiene un HUD minimalista y elegante.
- El sistema de tokens de color en `globals.css` (`--color-ink`, `--color-gold`, `bg-ok`, etc.) está bien definido.

**Riesgos principales:**
- **Contenido placeholder visible en producción**: "· Madrid" hardcodeado en la página pública de cada obra.
- **La pantalla de inicio del dashboard es débil para usuarios nuevos**: sin onboarding, sin contexto, con un QuickActions desalineado.
- **Inconsistencias sutiles** entre pantallas que se acumulan y rompen la percepción de calidad (selects nativos, radios de borde, variaciones en tamaños de título).
- Algunos estados vacíos y loaders son demasiado básicos para un producto de nivel premium.

---

## 2. Criterios de evaluación

| Criterio | Evaluado |
|---|---|
| Jerarquía visual | ✓ |
| Claridad de acciones | ✓ |
| Consistencia entre pantallas | ✓ |
| Look premium | ✓ |
| Legibilidad y tipografía | ✓ |
| Feedback al usuario | ✓ |
| Responsive | Parcial (sin dispositivo real) |
| Accesibilidad básica | Parcial |
| Estados vacíos, carga y error | ✓ |
| Coherencia con el producto | ✓ |

---

## 3. Hallazgos por prioridad

### 3.1 Alta prioridad

---

#### H1 — Hardcoded "· Madrid" en la página pública de obra

- **Pantalla / componente:** `/artworks/[id]` → `components/artwork/artwork-info-panel.tsx:57`
- **Problema detectado:** La línea del artista muestra `Por [nombre] · Madrid` con "Madrid" literalmente en el código. Ninguna obra tiene campo `location` en el schema de Prisma.
- **Por qué afecta:** Cualquier visitante ve "Madrid" aunque el artista sea de Berlín, Buenos Aires o Tokio. Es el tipo de placeholder que hace que un producto parezca inacabado ante usuarios reales.
- **Propuesta:** Eliminar `{' · Madrid'}` de la línea 57. Si en el futuro se añade `location` al schema del artista, se puede recuperar. Por ahora, simplemente `Por {artwork.artist}`.
- **Archivos:** `components/artwork/artwork-info-panel.tsx:57`
- **Riesgo:** Muy bajo — eliminar texto estático.
- **Prioridad: Alta**

---

#### H2 — Enlace del artista lleva a `href="#"` (no funcional)

- **Pantalla / componente:** `/artworks/[id]` → `components/artwork/artwork-info-panel.tsx:52`
- **Problema detectado:** El nombre del artista es un `<Link href="#">` que no navega a ningún sitio. En un perfil de artista visitado por coleccionistas esto es especialmente dañino.
- **Por qué afecta:** Un link que no lleva a ningún lado rompe la confianza del usuario. Parece inacabado y genera frustración.
- **Propuesta:** Si no existe página de perfil público de artista, eliminar el `<Link>` y dejar el nombre como `<span>`. Si existe (o cuando exista), enlazar correctamente. La sección `#artist` en la galería es el destino más cercano hoy.
- **Archivos:** `components/artwork/artwork-info-panel.tsx:48-58`
- **Riesgo:** Bajo — cambiar Link a span o actualizar el href.
- **Prioridad: Alta**

---

#### H3 — QuickActions: 3 cards en grid de 2 columnas (card huérfana)

- **Pantalla / componente:** `/dashboard` → `components/dashboard/quick-actions.tsx:15`
- **Problema detectado:** El grid es `grid-cols-2` con 3 elementos. El tercer elemento ("Mejorar plan") queda solo en la segunda fila, ocupando solo la mitad del ancho mientras la primera mitad queda vacía.
- **Por qué afecta:** Se percibe como un error de maquetación o como un componente inacabado. Rompe el ritmo visual del dashboard.
- **Propuesta:** Cambiar a `grid-cols-3` para 3 items iguales en una fila, o reducir a 2 acciones (eliminar "Mejorar plan" que ya está en el sidebar) y mantener `grid-cols-2`. La primera opción da más presencia.
- **Archivos:** `components/dashboard/quick-actions.tsx:15`
- **Riesgo:** Muy bajo — cambiar una clase de grid.
- **Prioridad: Alta**

---

#### H4 — Dashboard inicio: experiencia nula para usuarios nuevos (sin onboarding)

- **Pantalla / componente:** `/dashboard` → `app/dashboard/page.tsx`
- **Problema detectado:** Un artista que se registra por primera vez ve: saludo con skeleton, 4 estadísticas en cero, un grid vacío con solo un slot de "Nueva galería", y 3 quick actions. No hay ningún contexto sobre qué hacer ni por qué. No hay progresión ni sensación de bienvenida.
- **Por qué afecta:** La primera impresión del producto post-registro es decisiva. Un dashboard vacío sin guía puede hacer que el usuario abandone antes de crear su primera galería.
- **Propuesta:** Añadir un banner de "primeros pasos" condicional que aparezca solo cuando `galleries.length === 0`: explica los 3 pasos básicos (crear galería → subir obra → publicar), con CTAs. Desaparece en cuanto el artista tiene al menos una galería. Puede ser un componente simple `FirstStepsBanner` inline en `DashboardPage`.
- **Archivos:** `app/dashboard/page.tsx`, nuevo componente `components/dashboard/first-steps-banner.tsx`
- **Riesgo:** Bajo — componente nuevo condicional, sin tocar lógica existente.
- **Prioridad: Alta**

---

#### H5 — Sidebar: barra de plan calcula capacidad incorrectamente para artistas con múltiples galerías

- **Pantalla / componente:** Sidebar (`components/dashboard/sidebar.tsx:52-54`)
- **Problema detectado:** `usagePercent = (exposedCount / limits.artworksPerGallery) * 100`. Si un artista Plan Estándar tiene 2 galerías y 15 obras expuestas, el cálculo da 75% (15/20). Pero si tiene 18 obras expuestas (9 en cada galería), la barra muestra 90% cuando en realidad está al 45% de su capacidad total (18/40). O peor: con 22 obras en 2 galerías (11 cada una), la barra mostraría 110% — imposible visualmente pero el número puede saltar a >100%.
- **Por qué afecta:** La barra de progreso es una referencia rápida de capacidad. Si es incorrecta, el artista puede pensar que está al límite cuando no lo está, o viceversa.
- **Propuesta:** Calcular `usagePercent = (exposedCount / (limits.galleries * limits.artworksPerGallery)) * 100`. El texto debajo también debería actualizarse: "N de M obras (total)".
- **Archivos:** `components/dashboard/sidebar.tsx:52-54`
- **Riesgo:** Bajo — cálculo aritmético.
- **Prioridad: Alta**

---

### 3.2 Prioridad media

---

#### M1 — Botón "Borrador" poco claro en formulario de nueva obra

- **Pantalla / componente:** `/dashboard/artworks/new` → `components/dashboard/new-artwork-form.tsx`
- **Problema detectado:** El botón central de la barra de acciones dice solo "Borrador". El usuario no sabe si este botón guarda, descarta, o hace algo diferente al botón principal "Crear obra →".
- **Por qué conviene mejorarlo:** Un artista que usa el flujo por primera vez puede ignorar "Borrador" por miedo a perder su trabajo, o puede confundirlo con "Cancelar".
- **Propuesta:** Renombrar a "Guardar borrador" para que quede claro que es una acción de guardado (sin publicar). El trio de botones quedaría: Cancelar | Guardar borrador | Crear obra →
- **Archivos:** `components/dashboard/new-artwork-form.tsx` (línea del botón "Borrador")
- **Riesgo:** Muy bajo.
- **Prioridad: Media**

---

#### M2 — Inconsistencia: `<select>` nativo mezclado con UI personalizada

- **Pantallas:** `/dashboard/artworks/new` (selector de galería), `/obras` (selector de ordenación)
- **Problema detectado:** En ambas pantallas aparece un `<select>` HTML nativo. En la página de obras el select tiene bordes y aspecto custom relativamente aceptable, pero en el formulario de obra el `<select>` tiene solo `border-b` (bottom border) como el resto de inputs de texto — se confunde visualmente con un campo de texto normal y no transmite que es un selector. En contraste, el formulario de nueva galería usa botones tipo chip para la visibilidad.
- **Por qué conviene mejorarlo:** El `<select>` nativo rompe la consistencia visual. El diseño del proyecto usa bordes finos con acento gold para elementos interactivos, no el control del sistema operativo.
- **Propuesta:** Mantener el `<select>` nativo pero mejorar su estilo visual: añadir contenedor con borde completo, fondo `bg-bg3` y flecha personalizada (ya se hace en obras-catalog). Para el selector de galería en la obra, replicar el patrón de obras-catalog (`border border-(--border) bg-bg rounded-xs`).
- **Archivos:** `components/dashboard/new-artwork-form.tsx` (selector de galería), `components/public/obras-catalog.tsx` (ya aceptable)
- **Riesgo:** Bajo.
- **Prioridad: Media**

---

#### M3 — Confusión en precios del plan anual

- **Pantalla / componente:** `/dashboard/plan` → `components/dashboard/plan-manager.tsx`
- **Problema detectado:** Cuando el usuario selecciona "Anual · −20%", el precio cambia (ej: "10€") pero la etiqueta de periodo sigue siendo `/ mes` (ya que viene del objeto PLANS). No hay ningún texto que indique "se cobra anualmente" o "= 120€/año". El usuario puede pensar que paga mes a mes a precio reducido, cuando en realidad se cobra de golpe.
- **Por qué conviene mejorarlo:** Es una decisión financiera importante. La ambigüedad sobre si el pago es mensual o anual puede generar sorpresas desagradables y chargebacks.
- **Propuesta:** Añadir bajo el precio en modo anual: `facturado anualmente · ${price * 12}€/año`. El texto ya existe como "Xeuropeos ahorrados al año" pero se refiere a los ahorros, no al total cobrado. Ambas líneas juntas darían el contexto completo.
- **Archivos:** `components/dashboard/plan-manager.tsx` (sección de precio de cada plan card)
- **Riesgo:** Muy bajo — añadir texto condicional.
- **Prioridad: Media**

---

#### M4 — Estado vacío del historial de facturas muy básico

- **Pantalla / componente:** `/dashboard/plan` → `components/dashboard/plan-manager.tsx`
- **Problema detectado:** Cuando no hay facturas, la tabla muestra solo `<div className="... text-center">Sin facturas aún</div>`. Sin icono, sin contexto explicativo, sin ninguna orientación sobre cuándo aparecerán las facturas.
- **Por qué conviene mejorarlo:** Esta sección es especialmente importante para planes de pago. Un estado vacío cuidado transmite confianza.
- **Propuesta:** Añadir un pequeño icono (puede ser el símbolo `◎` en tamaño grande con opacidad) y dos líneas: "Sin facturas todavía." + "Las facturas aparecerán aquí tras tu primera suscripción." Mantener el mismo estilo de la nota de pie que ya existe.
- **Archivos:** `components/dashboard/plan-manager.tsx` (sección `invoices.length === 0`)
- **Riesgo:** Muy bajo.
- **Prioridad: Media**

---

#### M5 — Templates "Pronto" en formulario de nueva galería generan confusión

- **Pantalla / componente:** `/dashboard/galleries/new` → `components/dashboard/new-gallery-form.tsx`
- **Problema detectado:** "Long Hall" y "Open Room" aparecen en el selector con `opacity-35` y badge "Pronto". El usuario puede pensar que son funcionalidades bloqueadas por su plan, no que son plantillas aún no implementadas en el producto.
- **Por qué conviene mejorarlo:** La opacidad baja y el cursor `cursor-not-allowed` evocan "no tienes permiso" más que "en construcción". Hay riesgo de que usuarios de planes pagados intenten hacer upgrade pensando que desbloquean algo.
- **Propuesta:** O bien retirar completamente los botones disabled del selector (dejar solo "White Cube"), o añadir tooltip que diga "Plantilla en desarrollo — disponible próximamente" al hacer hover. El badge "Pronto" solo es visible sin hover porque está en posición `absolute -top-2.75`.
- **Archivos:** `components/dashboard/new-gallery-form.tsx:192-213`
- **Riesgo:** Bajo.
- **Prioridad: Media**

---

#### M6 — Avatar del topbar no es clickable (no enlaza al perfil)

- **Pantalla / componente:** Dashboard (todas las páginas) → `components/dashboard/topbar.tsx`
- **Problema detectado:** El avatar del artista en el topbar (`w-9 h-9 rounded-full`) es una imagen estática sin ninguna acción. No enlaza al perfil ni despliega ningún menú.
- **Por qué conviene mejorarlo:** Los usuarios de aplicaciones web asumen de forma universal que el avatar de la esquina superior derecha lleva al perfil o muestra un menú de cuenta. No tener esta acción es una ruptura de expectativa UX muy común.
- **Propuesta:** Envolver el avatar en `<Link href="/dashboard/profile">` con `title="Mi perfil"`. Alternativamente, añadir un small hover tooltip.
- **Archivos:** `components/dashboard/topbar.tsx:24-30`
- **Riesgo:** Muy bajo — envolver en Link.
- **Prioridad: Media**

---

#### M7 — Botón "Gestionar" en GalleriesGrid lleva a la lista general

- **Pantalla / componente:** `/dashboard` → `components/dashboard/galleries-grid.tsx:84`
- **Problema detectado:** El botón "Gestionar" en cada card de galería del dashboard home enlaza a `/dashboard/galleries` (la lista completa), no a algo específico de esa galería. La expectativa del usuario es llegar a la gestión de esa galería concreta.
- **Por qué conviene mejorarlo:** Actualmente hay que ir a `/dashboard/galleries`, encontrar la galería y hacer clic de nuevo. Es un paso extra innecesario.
- **Propuesta:** La pantalla de gestión de galerías no tiene ruta individual por galería (`/dashboard/galleries/[id]`). La solución más sencilla sin añadir rutas: cambiar "Gestionar" a "Gestionar obras" y enlazar a `/dashboard/artworks` (donde el artista puede filtrar y publicar obras para esa galería). O simplemente eliminar ese botón del dashboard home (ya está en la card de GalleriesManager) y mantener solo "Ver pública →" / "Previsualizar →".
- **Archivos:** `components/dashboard/galleries-grid.tsx:83-87`
- **Riesgo:** Bajo.
- **Prioridad: Media**

---

#### M8 — CTA "Contactar artista" deshabilitado cuando la obra no está en galería

- **Pantalla / componente:** `/artworks/[id]` → `components/artwork/artwork-info-panel.tsx:103-106`
- **Problema detectado:** Cuando `gallerySlug` es null (caso imposible en producción dado que la página solo muestra obras EXPOSED + PUBLIC, pero puede darse si hay inconsistencias de datos), aparece un botón semitransparente `bg-ink/40 text-bg/40 cursor-default`. El usuario ve un botón fantasma sin entender por qué está deshabilitado.
- **Por qué conviene mejorarlo:** Aunque el caso debería ser raro, el botón fantasma parece un error de UI. Es mejor no renderizar nada que renderizar algo inaccesible sin explicación.
- **Propuesta:** Cambiar el bloque `else` para simplemente no renderizar el CTA (`return null`) si no hay gallerySlug, en lugar de mostrar el botón deshabilitado.
- **Archivos:** `components/artwork/artwork-info-panel.tsx:103-106`
- **Riesgo:** Muy bajo.
- **Prioridad: Media**

---

#### M9 — Feedback de carga durante publicar/retirar obra es un solo carácter

- **Pantalla / componente:** `/dashboard/artworks` → `components/dashboard/artworks-list.tsx`
- **Problema detectado:** Durante la acción de publicar o retirar una obra, el botón muestra `'…'` (tres puntos) sin más contexto. En una pantalla con múltiples cards, el usuario puede no distinguir cuál obra está siendo procesada si pierde el foco visual.
- **Por qué conviene mejorarlo:** Un feedback textual específico ("Publicando…" / "Retirando…") refuerza que la acción está en progreso y da tranquilidad al usuario.
- **Propuesta:** Cambiar `publishingId === a.id ? '…' : 'Exponer'` por `publishingId === a.id ? 'Publicando…' : 'Exponer'` (y similar para Retirar).
- **Archivos:** `components/dashboard/artworks-list.tsx:229-230` y `:237`
- **Riesgo:** Muy bajo.
- **Prioridad: Media**

---

#### M10 — ArtistBar demasiado escueta (una sola métrica)

- **Pantalla / componente:** `/galleries/[slug]` → `components/gallery/artist-bar.tsx`
- **Problema detectado:** La sección del artista al final de la galería pública muestra: avatar, nombre, bio y un único número ("N Obras"). Si el artista no tiene sitio web, no hay ningún CTA ni acción posible. La sección queda desequilibrada con mucho espacio vacío a la derecha.
- **Por qué conviene mejorarlo:** Para un visitante interesado, la ArtistBar es el único punto de contacto. Sin CTA ni información adicional, el artista pierde una oportunidad de conversión.
- **Propuesta:** Añadir un segundo dato visible siempre: "Galerías: N" o "Miembro desde: año". En ausencia de website, mostrar un enlace "Ver todas sus galerías" apuntando a una ruta de búsqueda o bien mostrar un "Contactar" con `mailto:` (si se añade email al schema en el futuro). Por ahora, añadir la fecha de alta o el número de galerías da más peso a la sección sin cambiar la API.
- **Archivos:** `components/gallery/artist-bar.tsx`
- **Riesgo:** Medio — requiere pasar datos adicionales al componente desde `app/galleries/[slug]/page.tsx`.
- **Prioridad: Media**

---

#### M11 — Instrucciones de navegación del viewer ocultas en móvil

- **Pantalla / componente:** `/galleries/[slug]/viewer` → `app/galleries/[slug]/viewer/page.tsx:64`
- **Problema detectado:** El texto de ayuda "Arrastra · Rueda para zoom · Clic en una obra" tiene `max-md:hidden` — desaparece completamente en móvil. Los usuarios móviles entran al viewer 3D sin ninguna instrucción sobre cómo interactuar.
- **Por qué conviene mejorarlo:** En móvil, los gestos de navegación 3D (pinch-to-zoom, drag) no son intuitivos sin contexto. La primera experiencia puede ser frustrante.
- **Propuesta:** Mostrar un banner de ayuda temporal en móvil que desaparezca a los 4 segundos o al primer toque: "Toca y arrastra · Pellizca para zoom". Puede ser un componente independiente con `opacity-0` animado.
- **Archivos:** `app/galleries/[slug]/viewer/page.tsx`
- **Riesgo:** Bajo — componente nuevo sin tocar la lógica 3D.
- **Prioridad: Media**

---

### 3.3 Prioridad baja

---

#### L1 — Estadísticas del hero de la landing son ficticias

- **Pantalla / componente:** `/` → `components/landing/hero-section.tsx:7-11`
- **Problema:** `STATS = [{ target: 1200, label: 'Artistas' }, { target: 8400, label: 'Obras' }, { target: 340, label: 'Galerías' }]` — números hardcodeados sin relación con datos reales.
- **Propuesta:** A corto plazo, cambiar a una llamada real a la API o eliminar la sección de stats. A largo plazo, consultar estas métricas desde BD. Por ahora, si los números reales son menores, considerar eliminar los contadores.
- **Archivos:** `components/landing/hero-section.tsx:7-11`
- **Prioridad: Baja**

---

#### L2 — Chip de filtros usa `rounded-[20px]` (pill) mientras el resto del diseño es sharp

- **Pantallas:** `/obras`, `/dashboard/artworks`
- **Problema:** Los chips de filtro de tipo obra son `rounded-[20px]` (forma de pastilla). El resto de la interfaz usa `rounded-xs` (casi cuadrado) o bordes sin redondear. Los pills son más típicos de aplicaciones de consumo masivo; aquí contrastan con la estética editorial.
- **Propuesta:** Cambiar los chips de filtro a `rounded-xs` para alinearlos con el diseño general. También se puede plantear usar el pill conscientemente como señal de "filtro activo" pero de forma consistente en toda la app.
- **Archivos:** `components/dashboard/artworks-list.tsx`, `components/public/obras-catalog.tsx`
- **Prioridad: Baja**

---

#### L3 — Cards de obra en catálogo no muestran la galería de procedencia

- **Pantalla / componente:** `/obras` → `components/public/obras-catalog.tsx`
- **Problema:** Cada card muestra: tipo · artista · año. El dato `slot.gallery.name` está disponible pero no se muestra. Para un visitante que llega al catálogo, la galería de procedencia da contexto curatorial.
- **Propuesta:** Añadir el nombre de galería como texto pequeño debajo del título o como chip, de forma similar a como lo hace la página de detalle de obra.
- **Archivos:** `components/public/obras-catalog.tsx`
- **Prioridad: Baja**

---

#### L4 — `ObrasCatalog` tiene TYPE_LABEL local (duplicado de `lib/labels.ts`)

- **Pantalla / componente:** `components/public/obras-catalog.tsx:17-22`
- **Problema:** El §8.3 del AUDIT técnico actualizó 4 archivos pero no `obras-catalog.tsx`, que sigue con su propia copia local de `TYPE_LABEL`.
- **Propuesta:** Importar `TYPE_LABEL` desde `@/lib/labels` y eliminar la copia local.
- **Archivos:** `components/public/obras-catalog.tsx`
- **Prioridad: Baja**

---

#### L5 — Feedback "Publicando…" insuficiente en barra de acciones de la card de obra

- **Pantalla / componente:** `/dashboard/artworks` → barra de acciones de cada `ArtworkCard`
- **Problema:** Ya documentado en M9 respecto al texto `'…'`. Complementariamente, la card no tiene indicación visual de estado de carga (spinner, opacidad reducida) en el botón durante la espera.
- **Propuesta:** Además del texto, reducir opacity del botón a 70% y añadir `cursor-wait` durante el estado pending.
- **Archivos:** `components/dashboard/artworks-list.tsx`
- **Prioridad: Baja**

---

#### L6 — Sección de descripción de obras vacía no se omite: muestra línea vacía

- **Pantalla / componente:** `/artworks/[id]` → `components/artwork/artwork-info-panel.tsx:74`
- **Problema:** `<p className="...">{artwork.description}</p>` se renderiza siempre, incluso si `description` es `""` o `null`. Resulta en espacio vacío entre los metadatos y el CTA.
- **Propuesta:** Renderizar la descripción solo si existe: `{artwork.description && <p ...>...</p>}`.
- **Archivos:** `components/artwork/artwork-info-panel.tsx:74`
- **Prioridad: Baja**

---

#### L7 — Botones de plan sin `rounded-xs` (inconsistencia menor)

- **Pantalla / componente:** `/dashboard/plan` → `components/dashboard/plan-manager.tsx`
- **Problema:** Los botones CTA dentro de las plan cards ("Mejorar a Estándar", "Mejorar a Premium") no tienen `rounded-xs`, a diferencia de la mayoría de botones del dashboard.
- **Propuesta:** Añadir `rounded-xs` a esos botones.
- **Archivos:** `components/dashboard/plan-manager.tsx`
- **Prioridad: Baja**

---

#### L8 — La barra de capacidad del perfil tiene label confuso

- **Pantalla / componente:** `/dashboard/profile` → `components/dashboard/profile-form.tsx`
- **Problema:** La `CapacityBar` para obras muestra el label "Obras expuestas (total posible)". Es un texto técnico y parentético que puede confundir.
- **Propuesta:** Simplificar a "Obras expuestas" con el valor numérico (N / M) que ya aparece a la derecha de la barra.
- **Archivos:** `components/dashboard/profile-form.tsx`
- **Prioridad: Baja**

---

#### L9 — "Video art" en inglés dentro del TickerSection

- **Pantalla / componente:** `/` → `components/landing/ticker-section.tsx:4`
- **Problema:** Los ítems del ticker están en español excepto "Video art". Pequeña inconsistencia de tono.
- **Propuesta:** Cambiar a "Videoarte".
- **Archivos:** `components/landing/ticker-section.tsx`
- **Prioridad: Baja**

---

#### L10 — Redundancia visual entre "URL pública" y "Compartir perfil" en el perfil

- **Pantalla / componente:** `/dashboard/profile` → `components/dashboard/profile-form.tsx`
- **Problema:** La columna izquierda tiene una sección "URL pública" con campo de texto y botones Copiar + ↗. La columna derecha tiene una sección "Compartir perfil" que hace exactamente lo mismo (copia la misma URL). Son dos UI distintas para la misma función a 5cm de distancia.
- **Propuesta:** Eliminar la sección "Compartir perfil" del sidebar derecho o fusionarla con "URL pública" (mantener solo una de las dos). Alternativamente, si "Compartir" se orienta a redes sociales y "URL pública" a uso directo, diferenciarlos claramente.
- **Archivos:** `components/dashboard/profile-form.tsx`
- **Prioridad: Baja**

---

#### L11 — Meta grid de obra muestra valores vacíos cuando el campo está sin rellenar

- **Pantalla / componente:** `/artworks/[id]` → `components/artwork/artwork-info-panel.tsx:23-28`
- **Problema:** La meta grid muestra siempre 4 celdas (Técnica, Año, Dimensiones, Edición). Si el artista no rellenó Técnica o Dimensiones, la celda aparece con el label pero sin valor — visualmente raro.
- **Propuesta:** Filtrar el array `meta` para excluir pares cuyo valor sea vacío o `'0'` (el año 0 no debería mostrarse). Si quedan menos de 4 items, ajustar el grid a `grid-cols-2` o incluso `grid-cols-1` según lo que haya.
- **Archivos:** `components/artwork/artwork-info-panel.tsx:23-70`
- **Prioridad: Baja**

---

## 4. Pantallas más débiles visualmente

### 1. `/dashboard` (home) — cuando el artista no tiene galerías
**Por qué:** Después de quitar el ActivityFeed, el fondo de la página es: Greeting → 4 stats en cero → 1 slot vacío dashed → 3 QuickActions (con una card sola en segunda fila). Para un nuevo usuario esto se percibe como una interfaz casi vacía sin orientación.
**Qué mejorar primero:** Añadir el banner de primeros pasos (H4) + corregir QuickActions a `grid-cols-3` (H3).
**Nivel de esfuerzo:** Bajo.

### 2. `/artworks/[id]` — página pública de detalle de obra
**Por qué:** La hardcoded "· Madrid" (H1) y el link a `#` (H2) hacen que el panel de info parezca no terminado. La descripción vacía (L6) deja espacio muerto. El botón fantasma de "Contactar artista" (M8) completa la sensación de inacabado.
**Qué mejorar primero:** Correcciones H1, H2, M8 y L6 — todas de bajo riesgo.
**Nivel de esfuerzo:** Bajo.

### 3. `/dashboard/plan` — gestión del plan
**Por qué:** La confusión del precio anual (M3), el estado vacío de facturas (M4) y los botones sin `rounded-xs` (L7) se acumulan en una pantalla de decisión financiera donde la confianza es crítica.
**Qué mejorar primero:** Claridad del precio anual (M3) y estado vacío de facturas (M4).
**Nivel de esfuerzo:** Bajo.

### 4. `/obras` — catálogo público
**Por qué:** La mezcla de `<select>` nativo y chips personalizados (M2) se nota especialmente aquí. El catálogo es la primera pantalla que ve un visitante no registrado después del hero.
**Qué mejorar primero:** Mejorar el estilo del select de ordenación para que se integre visualmente con la barra de filtros.
**Nivel de esfuerzo:** Bajo.

### 5. `/dashboard/profile` — formulario de perfil
**Por qué:** La sección de "Compartir perfil" duplica la "URL pública" (L10). El label de capacidad es confuso (L8). La pantalla se percibe densa y con lógica visual redundante.
**Qué mejorar primero:** Eliminar la duplicidad (L10) y simplificar el label (L8).
**Nivel de esfuerzo:** Bajo a medio.

---

## 5. Componentes reutilizables a mejorar

### 5.1 Empty states genéricos
- **Problema actual:** Los estados vacíos son inconsistentes en profundidad visual. GalleryMasonry tiene SVG + título + subtítulo (muy bien). La tabla de facturas tiene solo texto centrado. ObrasCatalog tiene `◇` + texto + botón. ShowcaseEmpty tiene `◇` + texto + link.
- **Mejora recomendada:** Estandarizar un patrón mínimo: símbolo/icono grande (>40px, opacidad baja) + título en serif + subtítulo explicativo + CTA opcional. Usable para facturas, galerías vacías, resultados sin filtrar, etc.
- **Beneficio visual/UX:** Coherencia en situaciones de vacío + mayor calidad percibida en momentos clave.
- **Riesgo de tocarlo:** Bajo — cambios localizados a cada instancia.

### 5.2 Botones de carga (loading state)
- **Problema actual:** Los estados de carga de botones muestran textos inconsistentes: "Creando…", "Guardando…", "Publicando…", "…" (un solo carácter en artworks-list). La presencia o ausencia de opacity reducida y cursor changes varía.
- **Mejora recomendada:** Unificar el patrón: `disabled:opacity-60 cursor-wait` en todos los botones de acción durante estados pending, y texto explícito con "…" al final del verb ("Guardando…", "Publicando…").
- **Beneficio visual/UX:** El usuario siempre sabe qué está pasando.
- **Riesgo de tocarlo:** Muy bajo — cambios de texto y clases.

### 5.3 Inputs de formulario (selects)
- **Problema actual:** Dos tratamientos distintos para `<select>`: solo `border-b` en new-artwork-form vs borde completo con `bg-bg` en obras-catalog.
- **Mejora recomendada:** Establecer un estilo canónico para `<select>`: borde completo `border border-(--border) bg-bg rounded-xs`, flecha personalizada `▾` a la derecha, `focus:border-(--border-md)`.
- **Beneficio visual/UX:** Formularios más cohesionados visualmente.
- **Riesgo de tocarlo:** Bajo.

### 5.4 Topbar del dashboard
- **Problema actual:** El avatar no es clickable (M6). El título usa `<span>` en lugar de elemento semántico.
- **Mejora recomendada:** Hacer el avatar clickable → `/dashboard/profile`. El título podría ser un `<h1>` con los mismos estilos (sin cambio visual, mejora semántica).
- **Beneficio visual/UX:** Comportamiento esperado cumplido.
- **Riesgo de tocarlo:** Muy bajo.

### 5.5 Gallery preview cards (GalleriesGrid / GalleriesManager)
- **Problema actual:** El hover overlay en el preview de galería muestra "◈ Ver 3D" sobre la imagen, pero solo cuando el mouse está encima. La presencia de este CTA no se intuye.
- **Mejora recomendada:** Añadir una pequeña indicación permanente debajo de la imagen (ya existe en GalleriesManager con "◈ Ver 3D" + "Ver pública →" como botones en el hover overlay interior). Las cards de GalleriesGrid en el home son más compactas; podría añadirse un `◈ 3D` como chip permanente en la esquina del preview.
- **Beneficio visual/UX:** Descubribilidad del viewer 3D, acción clave del producto.
- **Riesgo de tocarlo:** Bajo.

---

## 6. Recomendaciones de diseño global

### 6.1 Sistema de border-radius
El diseño usa predominantemente esquinas sin redondear (sharp corners), lo cual es un rasgo de identidad editorial. Sin embargo, hay excepciones no justificadas:
- Filter chips: `rounded-[20px]` (pill)
- Algunos badges: `rounded-xs`
- Algunas barras de progreso: `rounded-full` o `rounded-sm`

**Recomendación:** Formalizar 2 niveles: `rounded-xs` para elementos interactivos (botones, inputs, badges de plan) y esquinas sin redondear para las cards/contenedores principales. Los pills de filtro deberían convertirse a `rounded-xs` o decidirse explícitamente como excepción para "chips de categoría".

### 6.2 Jerarquía tipográfica en el dashboard
Los títulos de sección del dashboard son inconsistentes:
- `font-serif text-[22px] font-bold` en GalleriesGrid y QuickActions (via `<span>`)
- `font-serif text-[20px] font-bold` en PlanManager ("Historial de facturación")
- `font-serif text-[18px] font-bold` en ProfileForm ("Información pública", "Capacidad del plan")
- `font-serif text-[16px] font-bold` en ProfileForm ("Cuenta")

**Recomendación:** Establecer 2 niveles explícitos para secciones de dashboard: `text-[22px]` para secciones de primer nivel (tabs/zonas principales), `text-[18px]` para sub-secciones dentro de una zona.

### 6.3 Consistencia en CTAs de artwork cards
En las cards de obra del dashboard hay 4+ acciones (Editar, Exponer/Retirar, Ver, Eliminar). La diferenciación visual podría mejorarse:
- **Primaria** (Exponer): gold con borde gold ✓
- **Secundaria** (Editar, Ver): borde gris neutro ✓
- **Destructiva** (Eliminar): ✕ pequeño con hover warn ✓
- El botón "Ver →" aparece solo cuando la obra está expuesta, ocupando el mismo espacio que otros botones pero con lógica condicional que puede desorientar.

**Recomendación:** Mover "Ver →" al área de imagen (ya existe en el hover overlay) y eliminar el botón redundante de la barra de acciones.

### 6.4 Onboarding progresivo
El producto carece de cualquier indicación de estado de completitud para el artista:
- ¿Ha subido su primera obra?
- ¿Tiene al menos una galería pública?
- ¿Ha configurado su bio y avatar?

**Recomendación:** Un simple checklist de "primeros pasos" en el dashboard home (oculto cuando todos están completados) mejoraría drásticamente la activación de nuevos usuarios.

### 6.5 Estados vacíos como oportunidades
Cada pantalla vacía es una oportunidad de guiar al usuario al siguiente paso. El patrón actual varía entre un estado vacío muy elaborado (GalleryMasonry con SVG de marcos) y uno muy básico (facturas).

**Recomendación:** Cualquier estado vacío debería responder a: ¿qué falta? ¿cómo lo soluciona el usuario? Añadir siempre al menos un CTA o una explicación de 1 línea.

### 6.6 Feedback tras acciones del usuario
La ausencia de toasts/notificaciones globales es deliberada (no hay librería de toast), pero algunos flows no tienen feedback claro:
- Publicar/retirar obra: el botón cambia de texto pero la card no muestra confirmación visual clara.
- Guardar configuración del viewer: hay un estado `saveError` pero no hay "guardado ✓" tras éxito.
- El perfil sí tiene `saved && <span className="text-ok">✓ Guardado</span>` — este patrón es bueno y debería replicarse en el viewer.

**Recomendación:** Aplicar el patrón `saved` del perfil al viewer scene-controls (ya en `savedConfig`/`saveError` pero sin feedback de éxito). Considerar añadir el mismo inline feedback a las acciones críticas de artworks-list.

---

## 7. Propuesta de plan de implementación

### Fase 1 — Correcciones UX urgentes
*Bloquean calidad del producto o inducen a error. Bajo riesgo, alto impacto.*

| ID | Descripción |
|---|---|
| H1 | Eliminar "· Madrid" hardcodeado de artwork-info-panel |
| H2 | Arreglar/eliminar `href="#"` del nombre del artista |
| H3 | QuickActions: cambiar a `grid-cols-3` |
| H5 | Sidebar: corregir cálculo de capacidad multi-galería |
| M6 | Topbar: hacer el avatar clickable → perfil |
| M8 | Ocultar CTA deshabilitado cuando no hay gallerySlug |
| M9 | Mejorar texto de loading en publish/unpublish |
| L6 | No renderizar descripción si está vacía |

**Estimación:** 1–2 horas de trabajo.

---

### Fase 2 — Unificación visual
*Mejoran la coherencia percibida entre pantallas. Bajo-medio riesgo.*

| ID | Descripción |
|---|---|
| M2 | Unificar estilo de `<select>` en toda la app |
| M3 | Clarificar precio anual en plan cards |
| M4 | Mejorar estado vacío de facturas |
| M7 | Botón "Gestionar" en GalleriesGrid: destino correcto |
| L4 | ObrasCatalog: importar TYPE_LABEL desde lib/labels |
| L7 | Plan cards: añadir `rounded-xs` a botones |
| L8 | Simplificar label de CapacityBar en perfil |
| L10 | Eliminar duplicidad "URL pública" / "Compartir perfil" |
| §6.1 | Normalizar border-radius: chips a `rounded-xs` |
| §6.2 | Fijar jerarquía tipográfica del dashboard |

**Estimación:** 2–4 horas.

---

### Fase 3 — Look premium
*Elevan la calidad visual global. Requieren más criterio de diseño.*

| ID | Descripción |
|---|---|
| H4 | Añadir banner de onboarding para usuarios nuevos |
| M1 | Borrador → "Guardar borrador" + mejoras de formulario |
| M5 | Gestionar templates "Pronto" con mejor UX |
| M10 | ArtistBar: añadir más datos / peso visual |
| L1 | Datos de hero: usar cifras reales o eliminar contadores |
| L3 | Cards de catálogo: mostrar galería de procedencia |
| L5 | Feedback visual (opacity/cursor) en botones pending |
| L9 | Ticker: "Video art" → "Videoarte" |
| L11 | Meta grid: filtrar campos vacíos |
| §5.1 | Estandarizar empty states |
| §6.3 | Simplificar barra de acciones de artwork cards |
| §6.5 | Mejorar vacíos como oportunidades |

**Estimación:** 3–6 horas.

---

### Fase 4 — Responsive y accesibilidad
*Ajustes para dispositivos móviles y accesibilidad básica.*

| ID | Descripción |
|---|---|
| M11 | Viewer: mostrar instrucciones de navegación en móvil |
| — | Revisar dashboard en móvil con `MobileDashboardNav` |
| — | Revisar el formulario de nueva obra en pantallas < 375px |
| — | Revisar el `grid-cols-4` de stats en pantallas medias (tablet portrait) |
| — | Labels de formulario: `htmlFor` consistente en todos los inputs |

**Estimación:** 2–4 horas.

---

## 8. No tocar todavía

Los siguientes cambios requieren validación previa o tienen riesgo alto:

- **Eliminar las plantillas "Pronto"** del formulario de nueva galería: puede hacerse, pero es una decisión de producto (¿comunicamos la hoja de ruta o no?). Esperar aprobación.
- **Añadir `location` al schema del artista**: solucionaría H1 de forma definitiva pero implica migración de Prisma + nuevo campo en UI.
- **Enlace público al perfil del artista** (para H2): no existe una página `/artists/[id]`. Crearla es una feature nueva, no una corrección visual.
- **Rediseñar el billing toggle de anual/mensual**: la lógica actual no distingue bien el precio anual total del mensual equivalente; requiere entender cómo está configurado Stripe para ese cliente antes de cambiar el copy.
- **Añadir galería al catálogo de obras** (`slot.gallery.name` en cada card): los datos están disponibles en la API, pero cambiar el layout de las cards de catálogo puede afectar el SEO y la experiencia de escaneo visual.
- **Mover "Ver →" del action bar al image hover**: hay usuarios que no hacen hover (móvil). Eliminar el botón del action bar puede romper el acceso en táctil.
- **Rediseñar el ArtistBar** con más datos: requiere añadir campos a la query de `getGalleryBySlug` y potencialmente al schema.

---

## 9. Conclusión

El proyecto tiene una base visual sólida y una identidad editorial clara. Las secciones de mayor calidad son el hero de la landing, el formulario de nueva galería y las cards de obra del dashboard. Los problemas más urgentes son los que afectan al contenido visible en producción (texto hardcodeado "· Madrid", link roto) y los que afectan a la orientación del usuario (onboarding vacío, QuickActions desalineado, avatar no clicable).

**Prioridad de ataque para máximo impacto mínimo riesgo:**
1. Las correcciones de la Fase 1 (H1, H2, H3, H5, M6, M8, M9, L6) pueden hacerse en una sesión corta y eliminan los errores más visibles.
2. Después, la Fase 2 de unificación visual hace que el producto se sienta coherente y terminado.
3. La Fase 3 (onboarding, premium polish) es la que transforma el producto de "funcional" a "aspiracional".

Un rediseño completo no es necesario ni recomendable en este momento. Con las correcciones de Fase 1 y 2, el producto gana significativamente en calidad percibida sin riesgo de regresiones.

---

## 10. Estado de implementación (2026-06-24)

Los hallazgos del audit se implementaron en tres iteraciones. Tabla de estado actual:

### Alta prioridad
| ID | Descripción | Estado |
|---|---|---|
| H1 | Eliminar "· Madrid" hardcodeado | ✅ Implementado |
| H2 | Arreglar `href="#"` del nombre del artista | ✅ Implementado |
| H3 | QuickActions: `grid-cols-3` | ✅ Implementado |
| H4 | Banner de primeros pasos | ✅ Implementado (`first-steps-banner.tsx`) |
| H5 | Sidebar: cálculo de capacidad multi-galería | ✅ Implementado |

### Media prioridad
| ID | Descripción | Estado |
|---|---|---|
| M1 | "Borrador" → "Guardar borrador" | ✅ Implementado |
| M2 | Estilo `<select>` unificado en formulario de obra | ✅ Implementado |
| M3 | Clarificar precio anual en plan cards | ✅ Implementado |
| M4 | Estado vacío de facturas mejorado | ✅ Implementado |
| M5 | Templates "Pronto" — decisión de producto | ⏸ Sin cambios (decisión aplazada) |
| M6 | Avatar del topbar clickable → perfil | ✅ Implementado |
| M7 | "Gestionar" → "Gestionar obras" + link correcto | ✅ Implementado |
| M8 | CTA "Contactar artista" oculto sin `gallerySlug` | ✅ Implementado |
| M9 | Texto "Publicando…" / "Retirando…" | ✅ Implementado |
| M10 | ArtistBar: "Miembro desde {año}" | ✅ Implementado |
| M11 | Instrucciones de navegación en viewer móvil | ✅ Implementado (`viewer-mobile-hint.tsx`) |

### Baja prioridad
| ID | Descripción | Estado |
|---|---|---|
| L1 | Datos del hero: reales o eliminar | ⏸ Sin cambios (decisión de producto) |
| L2 | Chips de filtro: `rounded-[20px]` → `rounded-xs` | ⏸ Sin cambios |
| L3 | Cards catálogo: chip de galería de procedencia | ✅ Implementado |
| L4 | ObrasCatalog: `TYPE_LABEL` desde `lib/labels.ts` | ✅ Implementado |
| L5 | `cursor-wait` + `opacity-60` en botones pending | ✅ Implementado |
| L6 | No renderizar descripción vacía | ✅ Implementado |
| L7 | Plan buttons: `rounded-xs` | ✅ Implementado |
| L8 | CapacityBar label: "Obras expuestas" | ✅ Implementado |
| L9 | "Video art" → "Videoarte" en ticker | ✅ Implementado |
| L10 | Eliminar "Compartir perfil" redundante | ✅ Implementado |
| L11 | Meta grid: filtrar campos vacíos | ✅ Implementado |

### Recomendaciones globales
| ID | Descripción | Estado |
|---|---|---|
| §6.1 | Normalizar border-radius del sistema | ✅ Parcialmente (chips `rounded-xs` en dashoard; pills del catálogo público sin cambio) |
| §6.2 | Jerarquía tipográfica del dashboard | ✅ Implementado |
| §6.3 | CTAs de artwork cards | ⏸ Sin cambios |
| §6.4 | Onboarding progresivo | ✅ Implementado via `first-steps-banner.tsx` |
| §6.5 | "✓ Guardado" tras guardar config del viewer | ✅ Implementado en `scene-controls.tsx` |
