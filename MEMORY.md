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

## Próximos Pasos (CRM & SuperAdmin)
1. **Desarrollo del CRM Profesional (SuperAdmin)**:
   - Crear el componente `SuperAdminCRM.tsx` con un diseño de "Data Command Center" (Bordes afilados, colores de alta visibilidad, denso en información).
   - Implementar métricas globales: Total de Usuarios, Propiedades Activas, Solicitudes Pendientes y Tasa de Conversión (Leads/Citas).
   - Añadir tabla de gestión de usuarios con filtros por `organizationId` y rol.
   - Implementar el "Global Broadcast" para enviar notificaciones a todos los usuarios de la plataforma.
2. **Auditoría y Telemetría**:
   - Visualización de movimientos recientes (logs de actividad de usuarios).
   - Gráficos de rendimiento (CPU Load simulado vs Carga de Datos real).
3. **Escalabilidad**:
   - Monitorear rendimiento del sort en memoria si la lista de propiedades supera los 500 registros.
   - Implementar paginación en el CRM para manejar grandes volúmenes de usuarios y propiedades.
