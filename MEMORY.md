# MEMORY.md - I LIKE Inmobiliaria

## Decisiones Arquitectónicas

### 1. Gestión de Datos y Persistencia (Firestore)
- **Problema**: Errores de `failed-precondition` por falta de índices compuestos al usar `orderBy`.
- **Decisión**: Se eliminó `orderBy` de las consultas directas a Firestore.
- **Implementación**: La ordenación se realiza ahora en el **lado del cliente** (Frontend) dentro de los servicios (`authService.ts`) y stores (`propertyStore.ts`) usando `.sort()`. Esto garantiza funcionamiento inmediato sin depender de la consola de Firebase para cada campo.
- **Fecha**: 2026-05-03

### 2. Integridad de Esquema
- **Problema**: Firestore rechaza campos con valor `undefined`.
- **Decisión**: Normalización de datos en el punto de entrada.
- **Implementación**: La función `getVal` en `PropertyModal.tsx` asegura que cualquier campo vacío retorne `''` (string vacío) en lugar de `undefined`.
- **Fecha**: 2026-05-03

### 3. Seguridad y Multi-tenancy
- **Problema**: El SuperAdmin (`apexdigital70@gmail.com`) no podía ver usuarios fuera de su organización.
- **Decisión**: Priorizar rol `SuperAdmin` en reglas de seguridad.
- **Implementación**: Ajuste en `firestore.rules` para permitir `get` y `list` al SuperAdmin sin restricciones de `organizationId`.
- **Fecha**: 2026-05-03

### 4. Purga de Código Legacy y Arquitectura Modular de Notificaciones
- **Problema**: El sistema de transmisión global ("Global Broadcast") tenía UI y lógica legacy acoplada directamente en `src/App.tsx`, lo que representaba deuda técnica y contaminación de estado en el archivo principal.
- **Decisión**: Eliminar por completo el modal y el estado legacy de transmisiones en `src/App.tsx`, delegando la gestión de notificaciones de forma limpia al store global de Zustand (`useCRMStore()`).
- **Implementación**: Se purgó la UI redundante y el manejador `handleBroadcast` de `src/App.tsx`. Ahora la comunicación utiliza el método centralizado y estructurado `broadcastNotification` de `useCRMStore()`, asegurando total integridad de tipos y compilación limpia (`tsc --noEmit` exitoso sin errores).
- **Fecha**: 2026-05-17

### 5. Rediseño Estético de Lujo "Pantone Space Navy & Royal Gold" (Alto Contraste 2026)
- **Problema**: La interfaz clara anterior se percibía blanca, plana, saturada y con falta de contraste y jerarquía de datos.
- **Decisión**: Transformación completa a una estética premium ultra-oscura basada en la paleta de lujo Pantone Space Navy (`#0a0e1a` y `#101420`), oro real refinado (`#FCC36B` y `#D9A241`), detalles HSL vibrantes y bordes de alta definición (`white/5`).
- **Implementación**:
  - Implementación de fondos de superficie premium con desenfoque de cristal (`glass-panel`, `backdrop-blur-2xl`).
  - Control riguroso de contraste con tipografías ultra nítidas en blanco puro, zinc y oro, mejorando drásticamente la legibilidad de metadatos uppercase y textos del navbar.
  - Sincronización del navbar inferior y toolbar con botones simétricos y unificados para una navegación móvil excepcional libre de elementos duplicados.
  - Optimización extrema de la barra de búsqueda en móviles utilizando un layout adaptativo de dos columnas (`grid-cols-2`) para selectores de operación/tipo y una fila horizontal compacta para el input de texto y botón con icono dorado, reduciendo su volumen vertical en un 50% y eliminando la saturación visual en pantallas móviles.
  - Integración modular de la Asesora IA en un panel tipo drawer de acceso rápido.
- **Fecha**: 2026-05-17

### 6. Corrección de Ordenamiento de Propiedades y Sincronización de UI
- **Problema**: Al actualizar, editar o crear una propiedad, el listado general en el frontend no reflejaba inmediatamente el cambio en el orden correcto, dejando las propiedades recién creadas o editadas al final.
- **Decisión**: Forzar ordenamiento descendente basado en marcas de tiempo en el lado del cliente.
- **Implementación**: Ajuste del store `propertyStore.ts` para ordenar determinísticamente los listados por el campo `updatedAt` o `createdAt` de manera descendente. Las propiedades más recientes o recién editadas aparecen de inmediato en el tope de la grilla.
- **Fecha**: 2026-05-17

## Hitos Logrados
- **CRM SuperAdmin de Alta Fidelidad**: Panel administrativo completamente funcional que segmenta métricas, controla usuarios en multi-tenancy estricto, gestiona listados y monitorea citas en tiempo real.
- **Asesora IA de I LIKE**: Integrada con Google Gemini (modelo `gemini-3-flash-preview`). Conecta automáticamente citas y cotizaciones con el CRM respetando el `organizationId`.
- **Filtro de Orden Dinámico**: Corrección definitiva del orden de renderizado en la grilla principal.
- **Paleta de Diseño Pantone Space Navy**: Un diseño que cautiva desde el primer vistazo con fondos oscuros profundos y acentos en oro radiante que realzan la exclusividad inmobiliaria.
- **Compilación de Producción Exitosa**: Vite compila al 100% sin errores de TypeScript ni linter (`Exit code: 0` verificado).

## Estado Actual de la Aplicación
1. **Frontend**: React + Vite + Tailwind CSS v4 con arquitectura de tokens de alta fidelidad oscuros y contrastes optimizados.
2. **Backend**: Firebase Firestore (Seguridad multi-tenant activa).
3. **Módulo IA**: Gemini API activa con historial de conversación y herramientas de agenda.
4. **Despliegue**: [i-like-app-web.vercel.app](https://i-like-app-web.vercel.app).

## Próximos Pasos (CRM & SuperAdmin)
1. **Paginación Dinámica**:
    - Agregar paginación al CRM y la grilla para colecciones masivas de propiedades.
2. **Dashboard Financiero**:
    - Mapeo de comisiones globales del SuperAdmin directo en la UI.
3. **Optimización SEO/GEO**:
    - Configurar tags dinámicos OpenGraph para previsualizaciones de propiedades de lujo en redes sociales.
