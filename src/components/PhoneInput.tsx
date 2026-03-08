import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatPhoneNumber, isPhoneComplete } from '@/lib/phoneFormat';

interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

const COUNTRIES: Country[] = [
  // Latin America
  { code: 'EC', dialCode: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: 'MX', dialCode: '+52', flag: '🇲🇽', name: 'México' },
  { code: 'CO', dialCode: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: 'PE', dialCode: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: 'AR', dialCode: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: 'BR', dialCode: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: 'CL', dialCode: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: 'VE', dialCode: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: 'CR', dialCode: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: 'PA', dialCode: '+507', flag: '🇵🇦', name: 'Panamá' },
  { code: 'SV', dialCode: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: 'GT', dialCode: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: 'HN', dialCode: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: 'NI', dialCode: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: 'BO', dialCode: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: 'PY', dialCode: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: 'UY', dialCode: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: 'CU', dialCode: '+53', flag: '🇨🇺', name: 'Cuba' },
  { code: 'DO', dialCode: '+1809', flag: '🇩🇴', name: 'Rep. Dominicana' },
  // North America
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: 'CA', dialCode: '+1', flag: '🇨🇦', name: 'Canadá' },
  // Europe
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'España' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Alemania' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'Francia' },
  { code: 'IT', dialCode: '+39', flag: '🇮🇹', name: 'Italia' },
  { code: 'PT', dialCode: '+351', flag: '🇵🇹', name: 'Portugal' },
  // Asia / Oceania
  { code: 'AU', dialCode: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'JP', dialCode: '+81', flag: '🇯🇵', name: 'Japón' },
  { code: 'KR', dialCode: '+82', flag: '🇰🇷', name: 'Corea del Sur' },
  { code: 'CN', dialCode: '+86', flag: '🇨🇳', name: 'China' },
  { code: 'IN', dialCode: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'TH', dialCode: '+66', flag: '🇹🇭', name: 'Tailandia' },
  { code: 'ID', dialCode: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: 'PH', dialCode: '+63', flag: '🇵🇭', name: 'Filipinas' },
  // Middle East / Africa
  { code: 'AE', dialCode: '+971', flag: '🇦🇪', name: 'EAU' },
  { code: 'EG', dialCode: '+20', flag: '🇪🇬', name: 'Egipto' },
  { code: 'ZA', dialCode: '+27', flag: '🇿🇦', name: 'Sudáfrica' },
];

// Sort by dial code length desc for matching, but keep original order for display
const SORTED_FOR_MATCH = [...COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

function detectCountry(phone: string): Country | null {
  const digits = phone.replace(/\D/g, '');
  for (const c of SORTED_FOR_MATCH) {
    const codeDigits = c.dialCode.replace('+', '');
    if (digits.startsWith(codeDigits)) return c;
  }
  return null;
}

interface PhoneInputProps {
  value: string;
  onChange: (formatted: string) => void;
  onValidate?: (formatted: string) => void;
  placeholder?: string;
  error?: string;
}

const PhoneInput = ({ value, onChange, onValidate, placeholder, error }: PhoneInputProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownRef, inputRef] = [useRef<HTMLDivElement>(null), useRef<HTMLInputElement>(null)];

  const selectedCountry = detectCountry(value);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCountrySelect = (country: Country) => {
    const currentDigits = value.replace(/\D/g, '');
    const currentCountry = detectCountry(value);
    let localDigits = '';

    if (currentCountry) {
      const oldCodeDigits = currentCountry.dialCode.replace('+', '');
      localDigits = currentDigits.slice(oldCodeDigits.length);
    }

    const newRaw = country.dialCode + localDigits;
    const formatted = formatPhoneNumber(newRaw);
    onChange(formatted);
    onValidate?.(formatted);
    setOpen(false);
    setSearch('');
    // Focus input after selection
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInputChange = (raw: string) => {
    if (raw && !/^[+\d\s]*$/.test(raw)) return;
    const formatted = raw.startsWith('+') ? formatPhoneNumber(raw) : raw;
    onChange(formatted);
    onValidate?.(formatted);
  };

  const filtered = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

    const complete = isPhoneComplete(value);

    return (
      <div className="relative">
        <div className="flex items-center">
          {/* Country selector button */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={cn(
                'flex items-center gap-1 h-10 px-2.5 rounded-l-md border border-r-0 border-input bg-muted/50 hover:bg-muted text-sm transition-colors',
                open && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
              )}
            >
              <span className="text-lg leading-none">
                {selectedCountry?.flag || '🌍'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-1 z-50 w-64 max-h-60 overflow-hidden rounded-md border border-border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar país..."
                    className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filtered.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left',
                        selectedCountry?.code === country.code && 'bg-accent/50 font-medium'
                      )}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span className="flex-1 truncate">{country.name}</span>
                      <span className="text-muted-foreground text-xs">{country.dialCode}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-3">Sin resultados</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone number input */}
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder || '+593 993 055 690'}
              className={cn('rounded-l-none', complete && 'pr-9')}
            />
            {complete && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
};

export default PhoneInput;
