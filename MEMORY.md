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

## Hitos Logrados
- **CRM SuperAdmin (Data Command Center)**: Implementado componente profesional `SuperAdminCRM.tsx` con métricas globales, gestión multi-tenant de usuarios, propiedades y solicitudes.
- **Asesora IA de I LIKE**: Integrada con Google Gemini (modelo `gemini-3-flash-preview`). Soporta *Function Calling* para agendar citas directamente en el CRM.
- **Normalización de Citas**: Las citas generadas por la IA ahora incluyen automáticamente el `organizationId` del usuario, garantizando visibilidad en el calendario.
- **Refinamiento de UI**: Botones flotantes (WhatsApp e IA) optimizados con contenedor Flexbox para evitar solapamientos y mejorar la estética en dispositivos móviles.
- **Despliegue Continuo**: Integración total con GitHub y Vercel exitosa.

## Estado Actual de la Aplicación
1. **Frontend**: React + Vite + Tailwind CSS v4.
2. **Backend**: Firebase Firestore (Seguridad multi-tenant activa).
3. **Módulo IA**: Gemini API activa con historial de conversación y herramientas de agenda.
4. **Despliegue**: [i-like-app-web.vercel.app](https://i-like-app-web.vercel.app).

## Próximos Pasos (CRM & SuperAdmin)
1. **Auditoría y Telemetría Avanzada**:
   - Gráficos de rendimiento real (Carga de Datos).
   - Implementar el "Global Broadcast" para enviar notificaciones a todos los usuarios.
2. **Optimización de Datos**:
   - Implementar paginación en el CRM para manejar volúmenes >500 registros.
3. **Refinamiento IA**:
   - Añadir más herramientas a la Asesora (consultar precios promedio, filtrar propiedades por zona vía voz).
