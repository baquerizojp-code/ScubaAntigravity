import { describe, it, expect } from 'vitest';
import { getLocalizedTripText } from '@/lib/tripText';

describe('getLocalizedTripText', () => {
  it('returns the requested locale when present', () => {
    expect(getLocalizedTripText({ en: 'Reef', es: 'Arrecife' }, 'en')).toBe('Reef');
    expect(getLocalizedTripText({ en: 'Reef', es: 'Arrecife' }, 'es')).toBe('Arrecife');
  });

  it('falls back to the other locale when requested one is missing', () => {
    expect(getLocalizedTripText({ es: 'Arrecife' }, 'en')).toBe('Arrecife');
    expect(getLocalizedTripText({ en: 'Reef' }, 'es')).toBe('Reef');
  });

  it('returns empty string when both locales are empty', () => {
    expect(getLocalizedTripText({ en: '', es: '' }, 'en')).toBe('');
    expect(getLocalizedTripText({}, 'es')).toBe('');
  });

  it('returns empty string for null or undefined', () => {
    expect(getLocalizedTripText(null, 'en')).toBe('');
    expect(getLocalizedTripText(undefined, 'es')).toBe('');
  });

  it('returns a plain string value as-is (backwards compat)', () => {
    expect(getLocalizedTripText('Plain text', 'en')).toBe('Plain text');
  });
});
