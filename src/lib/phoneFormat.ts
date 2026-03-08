/**
 * Country phone format definitions.
 * Each entry: country code prefix → group sizes for local digits.
 * E.g. Ecuador +593 has 9 local digits grouped as [3, 3, 3] → +593 993 055 690
 */
interface CountryFormat {
  code: string;
  groups: number[];
  totalLocal: number;
}

const COUNTRY_FORMATS: CountryFormat[] = [
  // North America
  { code: '+1', groups: [3, 3, 4], totalLocal: 10 },       // USA, Canada
  // Latin America
  { code: '+52', groups: [2, 4, 4], totalLocal: 10 },      // Mexico
  { code: '+54', groups: [2, 4, 4], totalLocal: 10 },      // Argentina
  { code: '+55', groups: [2, 5, 4], totalLocal: 11 },      // Brazil
  { code: '+56', groups: [1, 4, 4], totalLocal: 9 },       // Chile
  { code: '+57', groups: [3, 3, 4], totalLocal: 10 },      // Colombia
  { code: '+58', groups: [3, 3, 4], totalLocal: 10 },      // Venezuela
  { code: '+51', groups: [3, 3, 3], totalLocal: 9 },       // Peru
  { code: '+593', groups: [3, 3, 3], totalLocal: 9 },      // Ecuador
  { code: '+506', groups: [4, 4], totalLocal: 8 },         // Costa Rica
  { code: '+507', groups: [4, 4], totalLocal: 8 },         // Panama
  { code: '+503', groups: [4, 4], totalLocal: 8 },         // El Salvador
  { code: '+502', groups: [4, 4], totalLocal: 8 },         // Guatemala
  { code: '+504', groups: [4, 4], totalLocal: 8 },         // Honduras
  { code: '+505', groups: [4, 4], totalLocal: 8 },         // Nicaragua
  { code: '+591', groups: [1, 3, 4], totalLocal: 8 },      // Bolivia
  { code: '+595', groups: [3, 3, 3], totalLocal: 9 },      // Paraguay
  { code: '+598', groups: [2, 3, 3], totalLocal: 8 },      // Uruguay
  { code: '+53', groups: [1, 3, 4], totalLocal: 8 },       // Cuba
  { code: '+1809', groups: [3, 4], totalLocal: 7 },        // Dominican Republic
  // Europe
  { code: '+34', groups: [3, 3, 3], totalLocal: 9 },       // Spain
  { code: '+44', groups: [4, 6], totalLocal: 10 },         // UK
  { code: '+49', groups: [3, 4, 4], totalLocal: 11 },      // Germany
  { code: '+33', groups: [1, 2, 2, 2, 2], totalLocal: 9 }, // France
  { code: '+39', groups: [3, 3, 4], totalLocal: 10 },      // Italy
  { code: '+351', groups: [3, 3, 3], totalLocal: 9 },      // Portugal
  // Asia/Oceania
  { code: '+61', groups: [3, 3, 3], totalLocal: 9 },       // Australia
  { code: '+81', groups: [2, 4, 4], totalLocal: 10 },      // Japan
  { code: '+82', groups: [2, 4, 4], totalLocal: 10 },      // South Korea
  { code: '+86', groups: [3, 4, 4], totalLocal: 11 },      // China
  { code: '+91', groups: [5, 5], totalLocal: 10 },         // India
  { code: '+66', groups: [2, 3, 4], totalLocal: 9 },       // Thailand
  { code: '+62', groups: [3, 4, 4], totalLocal: 11 },      // Indonesia
  { code: '+63', groups: [3, 3, 4], totalLocal: 10 },      // Philippines
  // Middle East / Africa
  { code: '+971', groups: [2, 3, 4], totalLocal: 9 },      // UAE
  { code: '+20', groups: [3, 3, 4], totalLocal: 10 },      // Egypt
  { code: '+27', groups: [2, 3, 4], totalLocal: 9 },       // South Africa
];

// Sort by code length descending so longer codes match first (e.g. +593 before +59)
const SORTED_FORMATS = [...COUNTRY_FORMATS].sort((a, b) => b.code.length - a.code.length);

function findCountryFormat(digits: string): { format: CountryFormat; localStart: number } | null {
  for (const fmt of SORTED_FORMATS) {
    const codeDigits = fmt.code.replace('+', '');
    if (digits.startsWith(codeDigits)) {
      return { format: fmt, localStart: codeDigits.length };
    }
  }
  return null;
}

/**
 * Formats a phone number string as the user types.
 * Expects input starting with '+'.
 * Returns formatted string like "+593 993 055 690".
 */
export function formatPhoneNumber(raw: string): string {
  // Keep only digits and leading +
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (!digits || !hasPlus) return raw;

  const match = findCountryFormat(digits);

  if (!match) {
    // Unknown country — just add + and group in chunks of 3
    const groups: string[] = [];
    for (let i = 0; i < digits.length; i += 3) {
      groups.push(digits.slice(i, i + 3));
    }
    return '+' + groups.join(' ');
  }

  const { format, localStart } = match;
  const countryDigits = digits.slice(0, localStart);
  const localDigits = digits.slice(localStart);

  let result = '+' + countryDigits;
  let pos = 0;

  for (const groupSize of format.groups) {
    if (pos >= localDigits.length) break;
    const chunk = localDigits.slice(pos, pos + groupSize);
    result += ' ' + chunk;
    pos += groupSize;
  }

  // Any remaining digits beyond expected format
  if (pos < localDigits.length) {
    result += ' ' + localDigits.slice(pos);
  }

  return result;
}

/**
 * Strips formatting, returns raw digits with +
 */
export function stripPhoneFormat(formatted: string): string {
  const hasPlus = formatted.startsWith('+');
  const digits = formatted.replace(/\D/g, '');
  return (hasPlus ? '+' : '') + digits;
}
