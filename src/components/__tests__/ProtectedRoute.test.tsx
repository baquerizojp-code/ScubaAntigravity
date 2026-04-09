import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the useAuth hook to control auth state in tests
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import ProtectedRoute from '@/components/ProtectedRoute';

beforeEach(() => {
  mockUseAuth.mockReset();
});

function renderWithRouter(
  ui: React.ReactElement,
  { initialRoute = '/' }: { initialRoute?: string } = {},
) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/complete-profile" element={<div>Complete Profile</div>} />
        <Route path="/app/discover" element={<div>Diver Discover</div>} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: true });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should show spinner, not content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // The spinner div has animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects to login when no user', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to custom path when specified', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });

    renderWithRouter(
      <ProtectedRoute redirectTo="/complete-profile">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Complete Profile')).toBeInTheDocument();
  });

  it('redirects to /complete-profile when user has no role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1' },
      role: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Complete Profile')).toBeInTheDocument();
  });

  it('skips role check when skipRoleCheck is true', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1' },
      role: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute skipRoleCheck>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has an allowed role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1' },
      role: 'diver',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['diver']}>
        <div>Diver Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Diver Content')).toBeInTheDocument();
  });

  it('redirects diver to /app/discover when accessing admin route', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1' },
      role: 'diver',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['dive_center_admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Diver Discover')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('redirects admin to /admin when accessing diver route', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1' },
      role: 'dive_center_admin',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['diver']}>
        <div>Diver Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Diver Content')).not.toBeInTheDocument();
  });

  it('renders children when no allowedRoles specified and user has a role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1' },
      role: 'diver',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Any Role Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Any Role Content')).toBeInTheDocument();
  });
});
