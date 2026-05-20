# Arvista 3D — Business Rules refinadas

## 1. Propósito del producto
Arvista 3D es una plataforma donde artistas gestionan galerías virtuales propias y exponen sus obras para que visitantes puedan recorrerlas y consultar información de cada pieza.

El dominio se organiza en esta relación principal:

**Artista -> Galerías -> Obras**

---

## 2. Entidades del dominio

### 2.1 Artista
Usuario propietario del contenido.

Un artista:
- tiene una cuenta;
- tiene un plan de suscripción activo;
- puede tener varias galerías dentro del límite de su plan;
- puede crear y gestionar únicamente sus propias obras y galerías.

### 2.2 Galería
Espacio expositivo que pertenece a un único artista.

Una galería:
- pertenece a un solo artista;
- puede ser pública o privada;
- tiene una capacidad máxima de obras según el plan del artista;
- dispone de posiciones compatibles para ubicar obras expuestas.

### 2.3 Obra
Pieza artística propiedad de un único artista.

Una obra:
- pertenece a un solo artista;
- puede estar sin exponer o expuesta;
- solo puede exponerse en una galería del mismo artista;
- debe tener información suficiente para ser mostrada y consultada.

### 2.4 Suscripción
Regla que limita la capacidad operativa del artista.

La suscripción determina:
- el número máximo de galerías del artista;
- el número máximo de obras expuestas por galería.

---

## 3. Reglas maestras del negocio

### 3.1 Propiedad
1. Un artista solo puede gestionar sus propias galerías.
2. Un artista solo puede crear, editar y publicar sus propias obras.
3. Una galería solo puede pertenecer a un artista.
4. Una obra solo puede pertenecer a un artista.
5. Una obra solo puede exponerse en una galería de su mismo propietario.

### 3.2 Publicación de obras
1. Una obra puede existir sin estar expuesta.
2. Una obra queda expuesta solo cuando está asignada a una galería válida.
3. Para publicar una obra, deben cumplirse a la vez estas condiciones:
   - la obra pertenece al artista que realiza la acción;
   - la galería pertenece al mismo artista;
   - la galería no ha alcanzado el límite de obras permitido;
   - existe una posición compatible libre para esa obra.
4. Si alguna de esas condiciones falla, la publicación debe bloquearse.

### 3.3 Creación de galerías
1. Un artista solo puede crear galerías dentro del límite de su plan.
2. Si el límite de galerías está alcanzado, la creación de una nueva galería debe bloquearse.

### 3.4 Visibilidad
1. Una galería puede ser pública o privada.
2. Solo las galerías públicas son accesibles para visitantes.
3. La gestión de contenido está reservada al artista propietario.

---

## 4. Planes de suscripción

### 4.1 Plan Básico
- máximo 1 galería;
- máximo 10 obras expuestas por galería.

### 4.2 Plan Estándar
- máximo 2 galerías;
- máximo 20 obras expuestas por galería.

### 4.3 Plan Premium
- máximo 3 galerías;
- máximo 50 obras expuestas por galería.

### 4.4 Regla de validación
Toda acción que afecte a capacidad debe validarse contra el plan activo del artista antes de confirmarse.

---

## 5. Estados del negocio

### 5.1 Estado de una obra
Una obra puede estar en uno de estos estados funcionales:
- **sin exponer**: existe en el sistema pero no está asignada a ninguna galería;
- **expuesta**: está asignada a una galería válida y visible dentro de ella.

### 5.2 Estado de una galería
Una galería puede estar en uno de estos estados funcionales:
- **privada**: solo accesible para gestión interna del artista;
- **pública**: accesible para visitantes.

---

## 6. Reglas de organización de la galería

1. Cada galería debe disponer de posiciones de exposición compatibles con los tipos de obra admitidos.
2. La ubicación de una obra dentro de la galería se asigna automáticamente al publicarla.
3. Una obra solo puede ocupar una posición compatible y libre.
4. Si no existe una posición compatible libre, la obra no puede publicarse en esa galería.
5. Una galería no puede superar su capacidad máxima de obras expuestas.

---

## 7. Tipos de obra

El sistema debe contemplar, como mínimo, estos tipos de obra:
- pintura;
- escultura;
- fotografía;
- otro.

Regla general:
- cada obra debe tener una forma de exposición compatible con su tipo.

---

## 8. Datos mínimos del dominio

### 8.1 Artista
Datos mínimos necesarios:
- identificador;
- plan activo.

### 8.2 Galería
Datos mínimos necesarios:
- identificador;
- artista propietario;
- nombre;
- descripción;
- visibilidad.

### 8.3 Obra
Datos mínimos necesarios:
- identificador;
- artista propietario;
- galería asignada, si está expuesta;
- título;
- descripción;
- tipo;
- etiquetas o categoría;
- fecha o año;
- dimensiones, si existen;
- recurso principal asociado.

---

## 9. Funcionamiento para artistas

Un artista autenticado puede:
- gestionar su perfil;
- consultar su plan;
- crear galerías dentro del límite permitido;
- crear obras;
- editar sus obras;
- publicar una obra en una de sus galerías;
- retirar una obra de una galería.

Restricciones:
- no puede gestionar contenido ajeno;
- no puede publicar en galerías ajenas;
- no puede superar los límites de su suscripción.

---

## 10. Funcionamiento para visitantes

Un visitante puede:
- acceder a galerías públicas;
- recorrer la galería;
- consultar información resumida de una obra;
- abrir el detalle de una obra expuesta.

Un visitante no puede:
- crear, editar o publicar contenido.

---

## 11. Información visible de las obras

### 11.1 Información resumida
Cada obra expuesta debe poder mostrar, como mínimo:
- título;
- autor;
- tipo;
- año o categoría, si existe.

### 11.2 Información de detalle
Cada obra expuesta debe poder mostrar, como mínimo:
- título;
- autor;
- descripción;
- tipo;
- etiquetas;
- año o fecha;
- dimensiones, si existen;
- otros metadatos disponibles.

---

## 12. Flujos principales

### 12.1 Flujo del artista
1. Accede a su cuenta.
2. Consulta su plan.
3. Crea galerías dentro del límite permitido.
4. Registra una obra.
5. Decide si la deja sin exponer o la publica en una galería propia.
6. El sistema valida propiedad, capacidad y compatibilidad.
7. Si la validación es correcta, la obra queda expuesta.

### 12.2 Flujo del visitante
1. Entra en una galería pública.
2. Accede a las obras expuestas.
3. Recorre la galería.
4. Consulta información resumida de las obras.
5. Abre el detalle de una obra concreta.

---

## 13. Validaciones críticas

### 13.1 Integridad
1. Toda galería debe tener un artista propietario válido.
2. Toda obra debe tener un artista propietario válido.
3. Toda obra expuesta debe estar vinculada a una galería válida del mismo artista.

### 13.2 Capacidad
1. No se puede crear una galería si el plan no lo permite.
2. No se puede publicar una obra si la galería ha alcanzado su límite.
3. No se puede publicar una obra si no existe posición compatible libre.

### 13.3 Autorización
1. Solo el propietario puede gestionar una galería.
2. Solo el propietario puede editar o publicar una obra.

---

## 14. Reglas simplificadas para implementación

Estas reglas deben interpretarse así para evitar complejidad innecesaria:

1. Una obra solo puede estar expuesta en **una única galería a la vez**.
2. La capacidad se cuenta sobre **obras expuestas**, no sobre obras guardadas sin publicar.
3. La publicación de una obra es una operación única que:
   - valida permisos;
   - valida límites del plan;
   - valida disponibilidad de posición;
   - asigna la obra a la galería.
4. Retirar una obra de una galería libera su posición y deja la obra en estado **sin exponer**.
5. La forma exacta de representación visual no forma parte de las reglas de negocio, siempre que la obra pueda mostrarse y consultarse correctamente.

---

## 15. Resultado funcional esperado

El sistema debe permitir que cada artista administre sus propias galerías y obras dentro de los límites de su suscripción, y que los visitantes accedan solo a galerías públicas para consultar las obras expuestas.

Toda operación relevante debe respetar siempre estas cuatro condiciones:
- propiedad correcta;
- autorización correcta;
- límite de capacidad correcto;
- relación válida entre artista, galería y obra.
