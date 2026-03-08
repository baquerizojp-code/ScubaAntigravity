

## Plan: WhatsApp Validation + Extended Settings + Testing

### 1. WhatsApp Validation in RegisterCenter.tsx

Add client-side validation for the WhatsApp field using a regex pattern for international phone numbers (`^\+[1-9]\d{6,14}$`). Show an inline error message if the format is invalid. Prevent form submission until valid.

- Add `whatsappError` state
- Validate on change and on submit
- Show error text below the input in red
- Add i18n keys for the validation message (es/en)

### 2. Database Migration: Add New Columns to `dive_centers`

Add columns to the `dive_centers` table:
- `location` (text, nullable) — city/address
- `operating_hours` (text, nullable) — free-text schedule
- `website` (text, nullable)
- `instagram` (text, nullable)
- `facebook` (text, nullable)
- `tiktok` (text, nullable)

### 3. Expand Admin Settings Page

Add new fields to `Settings.tsx` organized in two cards:
- **Card 1 (existing)**: Name, Description, WhatsApp (with same validation as registration)
- **Card 2 (new)**: Location, Operating Hours, Website, Instagram, Facebook, TikTok

Wire all new fields to the update mutation. Add corresponding i18n keys.

### 4. i18n Keys to Add

Spanish:
- `admin.settings.location`: 'Ubicación'
- `admin.settings.hours`: 'Horarios'
- `admin.settings.website`: 'Sitio Web'
- `admin.settings.social`: 'Redes Sociales'
- `validation.whatsapp`: 'Formato inválido. Usa código de país (ej: +593 999 123 456)'

English equivalents accordingly.

### Files to Change
1. **Migration** — add 5 new columns to `dive_centers`
2. **`src/pages/RegisterCenter.tsx`** — WhatsApp validation with error state
3. **`src/pages/admin/Settings.tsx`** — new fields + WhatsApp validation + second card for social/location
4. **`src/lib/i18n.ts`** — new translation keys (both locales)

