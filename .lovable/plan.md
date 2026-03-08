

## Plan: Unificar Login/Signup en un solo botón "Comenzar"

Tienes razón — tener dos botones separados para login y signup es redundante. La página de Signup ya tiene un link a Login y viceversa, así que con un solo punto de entrada es suficiente.

### Cambios

**Navbar** (`src/components/Navbar.tsx`):
- Reemplazar los dos botones (Login ghost + Signup primary) por un solo botón "Comenzar" / "Get Started" que lleve a `/signup`
- Si el usuario ya tiene cuenta, desde `/signup` puede ir a `/login` con el link existente

**Landing hero** (`src/pages/Landing.tsx`):
- Mantener los dos CTAs del hero tal como están (uno para buzos, uno para centros) — estos SÍ tienen sentido porque diferencian audiencias
- En el footer: consolidar los links de Login y Signup en uno solo ("Iniciar sesión o crear cuenta" → `/signup`)

**i18n** (`src/lib/i18n.ts`):
- Agregar key `nav.getStarted` → "Comenzar" / "Get Started"

### Lo que NO cambia
- Los CTAs del hero y la sección CTA final se mantienen (diferencian buzo vs centro)
- Las páginas de Login y Signup se mantienen intactas con sus links cruzados

