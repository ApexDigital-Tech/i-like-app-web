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

### 5. Rediseño Estético Orgánico (Earthy Sanctuary 2026) y Depuración Visual
- **Problema**: Interfaz oscura muy saturada, elementos flotantes duplicados contaminando visualmente el viewport en móviles y afectando la experiencia editorial premium.
- **Decisión**: Transformación completa a paleta clara orgánica (Márfil Natural `#F8F6F0`, Terracota `#C06240` y Verde Salvia `#8CA17C`) y remoción del 100% de elementos flotantes superpuestos.
- **Implementación**:
  - Implementación de tipografías premium (`Playfair Display` para editorial, `Outfit` para UI de alta gama).
  - Centralización del chat interactivo "Asesora IA" en un cajón drawer modular integrado con Zustand, accesible desde la barra superior e inferior de navegación.
  - Sincronización del navbar móvil inferior en un layout simétrico de 5 botones que limpia completamente el login/logout flotante.
  - Incorporación del banner de soporte de WhatsApp y el panel de feedback directamente en el modal de ajustes/perfil, despejando la pantalla principal.
- **Fecha**: 2026-05-17

## Hitos Logrados
- **CRM SuperAdmin (Data Command Center)**: Implementado componente profesional `SuperAdminCRM.tsx` con métricas globales, gestión multi-tenant de usuarios, propiedades y solicitudes.
- **Asesora IA de I LIKE**: Integrada con Google Gemini (modelo `gemini-3-flash-preview`). Soporta *Function Calling* para agendar citas directamente en el CRM.
- **Normalización de Citas**: Las citas generadas por la IA ahora incluyen automáticamente el `organizationId` del usuario, garantizando visibilidad en el calendario.
- **Purga de Contaminación Visual**: Eliminación de widgets flotantes duplicados y botones encimados en favor de menús y toolbars nativos y limpios.
- **Transformación de Diseño 2026**: Nueva arquitectura visual premium "Earthy Sanctuary" con paleta marfil/terracota y bordes orgánicos sutiles.
- **Compilación de Producción Exitosa**: Vite compila al 100% sin errores de TypeScript ni linter en todo el ecosistema de componentes.

## Estado Actual de la Aplicación
1. **Frontend**: React + Vite + Tailwind CSS v4 con arquitectura de tokens orgánicos claros.
2. **Backend**: Firebase Firestore (Seguridad multi-tenant activa).
3. **Módulo IA**: Gemini API activa con historial de conversación y herramientas de agenda.
4. **Despliegue**: [i-like-app-web.vercel.app](https://i-like-app-web.vercel.app).

## Próximos Pasos (CRM & SuperAdmin)
1. **Auditoría y Telemetría Avanzada**:
    - Gráficos de rendimiento real (Carga de Datos).
2. **Optimización de Datos**:
    - Implementar paginación en el CRM para manejar volúmenes >500 registros.
3. **Refinamiento IA**:
    - Añadir más herramientas a la Asesora (consultar precios promedio, filtrar propiedades por zona vía voz).
