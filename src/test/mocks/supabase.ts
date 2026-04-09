/**
 * Supabase client mock for unit testing.
 *
 * Every service file imports `supabase` from `@/integrations/supabase/client`.
 * By mocking that module, we intercept all DB calls without touching the network.
 *
 * Usage in test files:
 *   import { mockSupabase, resetSupabaseMock } from '@/test/mocks/supabase';
 *   vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));
 *   beforeEach(() => resetSupabaseMock());
 */
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Builder helpers — chainable query mock that mimics the Supabase PostgREST API
// ---------------------------------------------------------------------------

/**
 * Loose chainable mock for inline test builders. Methods can be added ad-hoc
 * via vi.fn() and chained by returning `this`. Using Record<string, ...> avoids
 * `as any` casts on every builder while still being type-safe at the mock level.
 */
export interface TestChainBuilder {
  [method: string]: ReturnType<typeof vi.fn> | unknown;
  then?: (onFulfilled?: ((value: unknown) => unknown) | null, onRejected?: ((reason: unknown) => unknown) | null) => Promise<unknown>;
}

export function testChain(terminal: { data?: unknown; error?: unknown; count?: number | null }): TestChainBuilder {
  const b: TestChainBuilder = {};
  const chain = (..._args: unknown[]) => b;
  // Common chainable methods
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'in', 'gte', 'order', 'limit'] as const) {
    b[m] = vi.fn().mockImplementation(chain);
  }
  // Terminal methods
  b.single = vi.fn().mockResolvedValue({ data: terminal.data ?? null, error: terminal.error ?? null });
  b.maybeSingle = vi.fn().mockResolvedValue({ data: terminal.data ?? null, error: terminal.error ?? null });
  // Thenable for await
  b.then = (onFulfilled?: ((value: unknown) => unknown) | null, onRejected?: ((reason: unknown) => unknown) | null) =>
    Promise.resolve({ data: terminal.data ?? null, error: terminal.error ?? null, count: terminal.count ?? null }).then(onFulfilled, onRejected);
  return b;
}

export interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  // Resolved data/error at the end of the chain
  _resolve: { data: unknown; error: unknown; count?: number | null };
}

function createQueryBuilder(resolve?: { data: unknown; error: unknown; count?: number | null }): MockQueryBuilder {
  const defaultResolve = resolve ?? { data: null, error: null };

  const builder: MockQueryBuilder = {
    _resolve: defaultResolve,
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  // Every method returns the builder itself so calls are chainable.
  // Terminal methods (single, maybeSingle) return the resolved promise.
  const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'gte', 'order'] as const;
  for (const method of chainMethods) {
    builder[method].mockImplementation(() => builder);
  }

  // Terminal resolvers
  builder.single.mockImplementation(() => Promise.resolve({ data: builder._resolve.data, error: builder._resolve.error }));
  builder.maybeSingle.mockImplementation(() => Promise.resolve({ data: builder._resolve.data, error: builder._resolve.error }));

  // Make the builder itself thenable so `await supabase.from('x').select('*')` works.
  // PromiseLike requires a `then` method - we attach it via Object.defineProperty to avoid polluting the interface.
  Object.defineProperty(builder, 'then', {
    value: <TResult1 = unknown, TResult2 = never>(
      onFulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) =>
      Promise.resolve({ data: builder._resolve.data, error: builder._resolve.error, count: builder._resolve.count ?? null }).then(onFulfilled, onRejected),
    writable: true,
    enumerable: false,
    configurable: true,
  });

  return builder;
}

// ---------------------------------------------------------------------------
// The mock supabase client
// ---------------------------------------------------------------------------

// Map of table name -> query builder. Tests configure these per-table.
const tableBuilders = new Map<string, MockQueryBuilder>();

export const mockFrom = vi.fn((table: string) => {
  if (tableBuilders.has(table)) return tableBuilders.get(table)!;
  // Default: return empty builder that resolves null
  return createQueryBuilder();
});

export const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

export const mockAuth = {
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
};

export const mockSupabase = {
  from: mockFrom,
  rpc: mockRpc,
  auth: mockAuth,
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/**
 * Reset all mocks between tests.
 */
export function resetSupabaseMock() {
  tableBuilders.clear();
  mockFrom.mockImplementation((table: string) => {
    if (tableBuilders.has(table)) return tableBuilders.get(table)!;
    return createQueryBuilder();
  });
  mockRpc.mockReset().mockResolvedValue({ data: null, error: null });
  mockAuth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  mockAuth.getSession.mockResolvedValue({ data: { session: null } });
  mockAuth.signOut.mockResolvedValue({ error: null });
}

/**
 * Configure the mock to return specific data for a table.
 */
export function mockTable(table: string, resolve: { data: unknown; error: unknown; count?: number | null }): MockQueryBuilder {
  const builder = createQueryBuilder(resolve);
  tableBuilders.set(table, builder);
  // Re-wire mockFrom so it picks up the new builder
  mockFrom.mockImplementation((t: string) => {
    if (tableBuilders.has(t)) return tableBuilders.get(t)!;
    return createQueryBuilder();
  });
  return builder;
}
