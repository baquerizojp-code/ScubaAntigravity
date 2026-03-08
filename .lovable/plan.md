

## Problema actual

Hoy el flujo trata a buzos y centros de buceo como iguales: después del signup, ambos ven la misma pantalla de selección de rol con dos opciones lado a lado. Esto genera fricción para los buzos (que son el 90%+ de los usuarios) y no comunica que la app es principalmente para ellos.

## Recomendación: "Diver-first signup, Centro de buceo como feature secundario"

### Concepto UX

1. **Eliminar la pantalla de selección de rol (`/select-role`)** para el flujo principal.
2. **Todos los usuarios nuevos son buzos por defecto.** Después del signup, van directo a completar su perfil de buzo (nombre, certificación) y luego al feed de Discover.
3. **El registro de centro de buceo se convierte en un flujo separado**, accesible desde:
   - Un CTA secundario en el Landing ("¿Eres centro de buceo?") que lleva a `/register-center` — una página dedicada con su propio formulario de signup + datos del centro en un solo paso.
   - Un link discreto en el footer o en la página de login.
4. **Landing page** se reorienta 100% al buzo: el CTA principal dice "Crear cuenta gratis" y va a `/signup`. El botón "Soy Centro de Buceo" lleva a `/register-center`.

### Cambios técnicos

| Área | Cambio |
|---|---|
| **`/signup`** | Después de crear la cuenta, redirigir a `/complete-profile` (nuevo) en vez de `/select-role` |
| **`/complete-profile`** (nuevo) | Formulario corto: nombre completo + certificación. Al enviar, crea `user_roles(diver)` + `diver_profiles` automáticamente y redirige a `/app/discover` |
| **`/register-center`** (nuevo) | Página independiente con: email, password, nombre del centro, descripción, WhatsApp. Al enviar, crea cuenta + `user_roles(dive_center_admin)` + `dive_centers` + `staff_members` en un solo paso |
| **`/select-role`** | Se elimina. `ProtectedRoute` redirige a `/complete-profile` si el usuario no tiene rol |
| **`AuthContext`** | Sin cambios — ya maneja la lógica de roles correctamente |
| **`ProtectedRoute`** | Cambiar redirect de `/select-role` a `/complete-profile` cuando no hay rol asignado |
| **Landing page** | CTA principal → `/signup`. CTA secundario → `/register-center` |
| **Navbar** | Mantener igual, ya se adapta según rol |
| **i18n** | Agregar traducciones para las nuevas páginas y actualizar las existentes |

### Flujos resultantes

```text
BUZO (flujo principal):
Landing → Signup → Confirmar email → Login → /complete-profile → /app/discover

CENTRO DE BUCEO (flujo secundario):
Landing → "Soy Centro de Buceo" → /register-center → Confirmar email → Login → /admin

OAUTH (Google/Apple):
Landing → Signup con OAuth → /complete-profile → /app/discover
```

### Lo que NO cambia
- Panel admin, trips, bookings, notificaciones — todo igual
- Base de datos — no se necesitan migraciones
- RLS policies — sin cambios
- Flujo de staff invites — sin cambios

