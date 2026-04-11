import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the hook under test
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/services/trips', () => ({
  fetchTripById: vi.fn(),
}));

vi.mock('@/services/bookings', () => ({
  createBooking: vi.fn(),
  fetchBookingForTrip: vi.fn(),
  cancelBooking: vi.fn(),
  requestCancellation: vi.fn(),
}));

vi.mock('@/services/profiles', () => ({
  fetchDiverProfile: vi.fn(),
  createDiverProfile: vi.fn(),
  assignDiverRole: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/calendar', () => ({
  downloadICSFile: vi.fn(),
  getGoogleCalendarUrl: vi.fn(() => 'https://calendar.google.com/fake'),
}));

// i18n reads localStorage at module init; stub the hook so we don't load it.
vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: 'en' }),
}));

import { useTripBooking } from '../useTripBooking';
import { fetchTripById } from '@/services/trips';
import {
  createBooking,
  fetchBookingForTrip,
  cancelBooking,
  requestCancellation,
} from '@/services/bookings';
import {
  fetchDiverProfile,
  createDiverProfile,
  assignDiverRole,
} from '@/services/profiles';
import { downloadICSFile, getGoogleCalendarUrl } from '@/lib/calendar';
import { toast } from 'sonner';

const fakeUser = { id: 'user-1', user_metadata: { full_name: 'Jane Diver' } };
const fakeProfile = { id: 'profile-1', user_id: 'user-1', full_name: 'Jane Diver' };
const fakeTrip = {
  id: 'trip-1',
  title: 'Test Trip',
  dive_site: 'Reef',
  departure_point: 'Dock A',
  trip_date: '2026-05-01',
  trip_time: '08:00:00',
  dive_centers: { name: 'Blue Center' },
};

const refreshRole = vi.fn();

function setAuth(user: typeof fakeUser | null = fakeUser) {
  mockUseAuth.mockReturnValue({ user, refreshRole });
}

beforeEach(() => {
  vi.clearAllMocks();
  setAuth();
  vi.mocked(fetchTripById).mockResolvedValue(fakeTrip as never);
  vi.mocked(fetchDiverProfile).mockResolvedValue(fakeProfile as never);
  vi.mocked(fetchBookingForTrip).mockResolvedValue(null);
});

describe('useTripBooking', () => {
  describe('initial load', () => {
    it('fetches trip and existing booking, then exposes them', async () => {
      const existing = { id: 'b1', status: 'pending' };
      vi.mocked(fetchBookingForTrip).mockResolvedValue(existing as never);

      const { result } = renderHook(() => useTripBooking('trip-1'));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.trip).toEqual(fakeTrip);
      expect(result.current.existingBooking).toEqual(existing);
      expect(result.current.isPending).toBe(true);
      expect(fetchTripById).toHaveBeenCalledWith('trip-1');
      expect(fetchBookingForTrip).toHaveBeenCalledWith('trip-1', 'profile-1');
    });

    it('does nothing when tripId is undefined', () => {
      renderHook(() => useTripBooking(undefined));
      expect(fetchTripById).not.toHaveBeenCalled();
    });

    it('pre-fills dialogFullName from user metadata', async () => {
      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.dialogFullName).toBe('Jane Diver');
    });
  });

  describe('handleBook', () => {
    it('creates a booking and navigates to /app/bookings on success', async () => {
      vi.mocked(createBooking).mockResolvedValue({} as never);

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleBook();
      });

      expect(createBooking).toHaveBeenCalledWith('trip-1', 'profile-1', undefined);
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/app/bookings');
    });

    it('passes notes when present', async () => {
      vi.mocked(createBooking).mockResolvedValue({} as never);

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setNotes('bring weights'));
      await act(async () => {
        await result.current.handleBook();
      });

      expect(createBooking).toHaveBeenCalledWith('trip-1', 'profile-1', 'bring weights');
    });

    it('opens the profile dialog when diver has no profile', async () => {
      // Initial load succeeds with a profile, then second call (inside handleBook) returns null.
      vi.mocked(fetchDiverProfile)
        .mockResolvedValueOnce(fakeProfile as never)
        .mockResolvedValueOnce(null);

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleBook();
      });

      expect(result.current.showProfileDialog).toBe(true);
      expect(createBooking).not.toHaveBeenCalled();
    });

    it('shows error toast and does not navigate when createBooking fails', async () => {
      vi.mocked(createBooking).mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleBook();
      });

      expect(toast.error).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('handleCompleteProfileAndBook', () => {
    it('assigns role, creates profile, refreshes role, and books', async () => {
      const newProfile = { id: 'profile-2' };
      vi.mocked(createDiverProfile).mockResolvedValue(newProfile as never);
      vi.mocked(createBooking).mockResolvedValue({} as never);

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.setDialogFullName('New Diver'));
      act(() => result.current.setDialogCertification('open_water'));

      await act(async () => {
        await result.current.handleCompleteProfileAndBook();
      });

      expect(assignDiverRole).toHaveBeenCalledWith('user-1');
      expect(createDiverProfile).toHaveBeenCalledWith({
        user_id: 'user-1',
        full_name: 'New Diver',
        certification: 'open_water',
      });
      expect(refreshRole).toHaveBeenCalled();
      expect(createBooking).toHaveBeenCalledWith('trip-1', 'profile-2', undefined);
      expect(result.current.showProfileDialog).toBe(false);
    });

    it('is a no-op when full name is blank', async () => {
      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));
      act(() => result.current.setDialogFullName('   '));

      await act(async () => {
        await result.current.handleCompleteProfileAndBook();
      });

      expect(assignDiverRole).not.toHaveBeenCalled();
      expect(createDiverProfile).not.toHaveBeenCalled();
    });
  });

  describe('handleCancelPending', () => {
    it('cancels the booking and updates local state to cancelled', async () => {
      const existing = { id: 'b1', status: 'pending' };
      vi.mocked(fetchBookingForTrip).mockResolvedValue(existing as never);
      vi.mocked(cancelBooking).mockResolvedValue(undefined as never);

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.existingBooking).toEqual(existing));

      await act(async () => {
        await result.current.handleCancelPending();
      });

      expect(cancelBooking).toHaveBeenCalledWith('b1');
      expect(result.current.existingBooking?.status).toBe('cancelled');
      expect(result.current.showCancelDialog).toBe(false);
    });

    it('is a no-op when there is no existing booking', async () => {
      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.handleCancelPending();
      });

      expect(cancelBooking).not.toHaveBeenCalled();
    });
  });

  describe('handleRequestCancellation', () => {
    it('requests cancellation and updates state to cancellation_requested', async () => {
      const existing = { id: 'b1', status: 'confirmed' };
      vi.mocked(fetchBookingForTrip).mockResolvedValue(existing as never);
      vi.mocked(requestCancellation).mockResolvedValue(undefined as never);

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.existingBooking).toEqual(existing));

      await act(async () => {
        await result.current.handleRequestCancellation();
      });

      expect(requestCancellation).toHaveBeenCalledWith('b1');
      expect(result.current.existingBooking?.status).toBe('cancellation_requested');
      expect(result.current.isCancellationRequested).toBe(true);
    });

    it('shows error toast when request fails', async () => {
      const existing = { id: 'b1', status: 'confirmed' };
      vi.mocked(fetchBookingForTrip).mockResolvedValue(existing as never);
      vi.mocked(requestCancellation).mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.existingBooking).toEqual(existing));

      await act(async () => {
        await result.current.handleRequestCancellation();
      });

      expect(toast.error).toHaveBeenCalled();
      // Status stays confirmed on failure
      expect(result.current.existingBooking?.status).toBe('confirmed');
    });
  });

  describe('handleAddToCalendar', () => {
    it('opens Google Calendar URL in a new tab for "google"', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleAddToCalendar('google'));

      expect(getGoogleCalendarUrl).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith('https://calendar.google.com/fake', '_blank');
      openSpy.mockRestore();
    });

    it('downloads an ICS file for "ics"', async () => {
      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => result.current.handleAddToCalendar('ics'));

      expect(downloadICSFile).toHaveBeenCalled();
    });
  });

  describe('status flags', () => {
    it.each([
      ['pending', { isPending: true, isConfirmed: false, isCancellationRequested: false }],
      ['confirmed', { isPending: false, isConfirmed: true, isCancellationRequested: false }],
      ['cancellation_requested', { isPending: false, isConfirmed: false, isCancellationRequested: true }],
      ['cancelled', { isPending: false, isConfirmed: false, isCancellationRequested: false }],
    ])('derives flags correctly for status %s', async (status, expected) => {
      vi.mocked(fetchBookingForTrip).mockResolvedValue({ id: 'b1', status } as never);
      const { result } = renderHook(() => useTripBooking('trip-1'));
      await waitFor(() => expect(result.current.existingBooking?.status).toBe(status));
      expect(result.current.isPending).toBe(expected.isPending);
      expect(result.current.isConfirmed).toBe(expected.isConfirmed);
      expect(result.current.isCancellationRequested).toBe(expected.isCancellationRequested);
    });
  });
});
