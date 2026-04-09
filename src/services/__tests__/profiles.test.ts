import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMock, mockFrom, testChain, type MockQueryBuilder } from '@/test/mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));

import {
  fetchDiverProfile,
  createDiverProfile,
  updateDiverProfile,
  fetchDiveCenter,
  updateDiveCenter,
  assignDiverRole,
} from '@/services/profiles';
import type { TablesInsert } from '@/integrations/supabase/types';

beforeEach(() => resetSupabaseMock());

// -----------------------------------------------------------------------
// fetchDiverProfile
// -----------------------------------------------------------------------
describe('fetchDiverProfile', () => {
  it('returns profile when found', async () => {
    const profile = { id: 'p1', user_id: 'u1', full_name: 'JP' };
    mockFrom.mockImplementation(() => testChain({ data: profile }) as unknown as MockQueryBuilder);

    const result = await fetchDiverProfile('u1');
    expect(result).toEqual(profile);
  });

  it('returns null when no profile exists', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null }) as unknown as MockQueryBuilder);

    const result = await fetchDiverProfile('u-nonexistent');
    expect(result).toBeNull();
  });

  it('throws on error', async () => {
    mockFrom.mockImplementation(() => testChain({ error: { message: 'RLS denied' } }) as unknown as MockQueryBuilder);

    await expect(fetchDiverProfile('u1')).rejects.toEqual({ message: 'RLS denied' });
  });
});

// -----------------------------------------------------------------------
// createDiverProfile
// -----------------------------------------------------------------------
describe('createDiverProfile', () => {
  it('creates and returns the profile', async () => {
    const newProfile = { id: 'p-new', full_name: 'New Diver' };
    mockFrom.mockImplementation(() => testChain({ data: newProfile }) as unknown as MockQueryBuilder);

    const result = await createDiverProfile({ full_name: 'New Diver', user_id: 'u1' } as TablesInsert<'diver_profiles'>);
    expect(result).toEqual(newProfile);
  });

  it('throws on insert error', async () => {
    mockFrom.mockImplementation(() => testChain({ error: { message: 'constraint' } }) as unknown as MockQueryBuilder);

    await expect(createDiverProfile({} as TablesInsert<'diver_profiles'>)).rejects.toEqual({ message: 'constraint' });
  });
});

// -----------------------------------------------------------------------
// updateDiverProfile
// -----------------------------------------------------------------------
describe('updateDiverProfile', () => {
  it('updates and returns the profile', async () => {
    const updated = { id: 'p1', full_name: 'Updated Name' };
    mockFrom.mockImplementation(() => testChain({ data: updated }) as unknown as MockQueryBuilder);

    const result = await updateDiverProfile('p1', { full_name: 'Updated Name' });
    expect(result).toEqual(updated);
  });
});

// -----------------------------------------------------------------------
// fetchDiveCenter
// -----------------------------------------------------------------------
describe('fetchDiveCenter', () => {
  it('returns dive center data', async () => {
    const center = { id: 'dc1', name: 'Cancun Divers' };
    mockFrom.mockImplementation(() => testChain({ data: center }) as unknown as MockQueryBuilder);

    const result = await fetchDiveCenter('dc1');
    expect(result).toEqual(center);
  });

  it('throws when center not found', async () => {
    mockFrom.mockImplementation(() => testChain({ error: { message: 'not found', code: 'PGRST116' } }) as unknown as MockQueryBuilder);

    await expect(fetchDiveCenter('nope')).rejects.toEqual(
      expect.objectContaining({ message: 'not found' })
    );
  });
});

// -----------------------------------------------------------------------
// updateDiveCenter
// -----------------------------------------------------------------------
describe('updateDiveCenter', () => {
  it('updates without error', async () => {
    mockFrom.mockImplementation(() => testChain({}) as unknown as MockQueryBuilder);

    await expect(updateDiveCenter('dc1', { name: 'New Name' })).resolves.toBeUndefined();
  });

  it('throws on update error', async () => {
    mockFrom.mockImplementation(() => testChain({ error: { message: 'denied' } }) as unknown as MockQueryBuilder);

    await expect(updateDiveCenter('dc1', { name: 'X' })).rejects.toEqual({ message: 'denied' });
  });
});

// -----------------------------------------------------------------------
// assignDiverRole
// -----------------------------------------------------------------------
describe('assignDiverRole', () => {
  it('inserts diver role', async () => {
    const insertMock = vi.fn();
    const b = testChain({}) as unknown as MockQueryBuilder;
    b.insert = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
      insertMock(payload);
      return b;
    });
    mockFrom.mockImplementation(() => b);

    await assignDiverRole('u1');
    expect(insertMock).toHaveBeenCalledWith({ user_id: 'u1', role: 'diver' });
  });

  it('ignores duplicate key errors', async () => {
    mockFrom.mockImplementation(() => testChain({ error: { message: 'duplicate key value violates unique constraint' } }) as unknown as MockQueryBuilder);

    // Should NOT throw for duplicate errors
    await expect(assignDiverRole('u1')).resolves.toBeUndefined();
  });

  it('throws on non-duplicate errors', async () => {
    mockFrom.mockImplementation(() => testChain({ error: { message: 'permission denied' } }) as unknown as MockQueryBuilder);

    await expect(assignDiverRole('u1')).rejects.toEqual({ message: 'permission denied' });
  });
});
