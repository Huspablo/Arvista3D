# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

**Arvista 3D** — plataforma de galerías virtuales donde artistas gestionan y exponen sus obras, y los visitantes las recorren en 3D.

Reglas de negocio completas en [BUSINESS_RULES.md](BUSINESS_RULES.md).

## Dominio central

Relación principal: **Artista → Galerías → Obras**

| Entidad | Clave |
|---|---|
| Artista | Propietario del contenido, tiene un plan de suscripción |
| Galería | Pertenece a un artista, pública o privada, tiene posiciones |
| Obra | Pertenece a un artista, puede estar expuesta o sin exponer |
| Suscripción | Limita nº de galerías y obras expuestas por galería |

**Planes:**
- Básico: 1 galería, 10 obras/galería
- Estándar: 2 galerías, 20 obras/galería
- Premium: 3 galerías, 50 obras/galería

**Tipos de obra:** pintura, escultura, fotografía, otro.

## Reglas de negocio críticas

1. Un artista solo gestiona su propio contenido (galerías y obras).
2. Una obra solo puede exponerse en una galería del mismo artista.
3. Publicar una obra requiere: propiedad correcta + galería válida + límite no alcanzado + posición compatible libre.
4. Retirar una obra libera su posición y la deja en estado "sin exponer".
5. La capacidad se cuenta sobre obras **expuestas**, no sobre las guardadas.
6. Los visitantes solo acceden a galerías **públicas**.

## Roles de usuario

- **Artista** (autenticado): gestiona perfil, galerías y obras dentro de su plan.
- **Visitante**: navega galerías públicas, consulta obras expuestas, sin crear contenido.

## Stack tecnológico

Stack completo definido en [STACK.md](STACK.md). Resumen:

| Capa | Tecnología |
|---|---|
| Plataforma web | Next.js (App Router) + React + TypeScript |
| Viewer 3D | Three.js + React Three Fiber + Drei |
| UI 2D | Tailwind CSS + componentes propios |
| Estado local | Zustand |
| Datos remotos | TanStack Query |
| Backend | Next.js Route Handlers + capa de servicios |
| Jobs asíncronos | Inngest |
| Base de datos | PostgreSQL + Prisma |
| Auth | Clerk |
| Billing | Stripe Billing |
| Storage + CDN | Cloudflare R2 + CDN |
| Imagen | Sharp |
| Observabilidad | Sentry |

## Arquitectura clave

- **Gallery Manifest**: el backend entrega un manifest semántico (plantilla + slots + obras + recursos) que el viewer consume. La escena no se guarda manualmente.
- **Pipeline por tipo de obra**: pinturas/fotos → plano con textura (`wall_plane`); esculturas → modelo GLB en pedestal (`floor_model`). El manifest especifica el modo de representación por slot; el viewer no lo infiere.
- **Assets**: subida directa a Cloudflare R2 con URL prefirmada → procesamiento asíncrono con Inngest → derivados optimizados servidos desde CDN.

## Diseño del dominio

- Esquema de base de datos: [prisma/schema.prisma](prisma/schema.prisma)
- Contrato del viewer 3D: [GALLERY_MANIFEST.md](GALLERY_MANIFEST.md) — tipos TypeScript + ejemplo JSON + reglas de generación.

## Convenciones Tailwind CSS (v4)

Este proyecto usa Tailwind v4. Seguir siempre la sintaxis canónica; el IDE reporta warnings `suggestCanonicalClasses` si se usa la forma arbitraria cuando existe una equivalente nativa.

### Variables CSS
- Las variables definidas en `@theme` de `globals.css` tienen utilidades directas: usar `text-warn`, `text-ok`, `bg-warn`, `bg-ok`, `text-gold`, `bg-gold`, etc. **Nunca** `text-(--color-warn)` ni `text-(--color-ok)`.
- Las variables de `:root` (con opacidad) no tienen shorthand y se referencian con `(--border)`, `(--gold-dim)`, etc.

### Valores arbitrarios → escala Tailwind
- **Espaciado** (`p`, `m`, `gap`, `w`, `h`, `min-h`, `max-w`, `top`, `left`…): 1 unidad = 4 px. Usar la escala: `[8px]` → `2`, `[10px]` → `2.5`, `[60px]` → `15`, `[600px]` → `150`, etc. `[1px]` → `px`.
- **Border radius**: `[2px]` → `rounded-xs`.
- **Duración**: `[400ms]` → `duration-400`, `[700ms]` → `duration-700`, etc. (sin `ms`).
- **Z-index**: `z-[5]` → `z-5`.

### Colores oklch en valores arbitrarios
Usar `/` (sin espacios con guión bajo) para el separador de alfa:
```
border-[oklch(56%_0.14_155/0.2)]   ✓
border-[oklch(56%_0.14_155_/_0.2)] ✗
```

### Modificador `!important`
En Tailwind v4 el `!` va al **final** de la clase, no al principio:
```
max-md:col-[span_1]!   ✓
max-md:!col-[span_1]   ✗
```

### Transiciones
Evitar combinar `transition-shadow` + `transition-colors` en el mismo elemento (conflicto CSS); usar `transition` que cubre ambas.
