import type { TrackdayEvent, SkillLevel, Participant } from '../types';

export interface CreateEventInput {
  venue: string;
  date: string;
  timeOfDay: 'Day' | 'Evening';
  organiser: string;
  groups: SkillLevel[];
}

// In production set VITE_API_URL to your deployed backend URL
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001/api';
const ROOT_URL =
  (import.meta.env.VITE_API_ROOT_URL as string | undefined) ??
  'http://localhost:3001';

const NETWORK_ERROR_MESSAGE =
  'Cannot reach backend. Check API URL, CORS, and backend health.';

const parseErrorMessage = async (res: Response, fallback: string) => {
  const err = await res.json().catch(() => ({ error: res.statusText }));
  return (err as { error?: string }).error || fallback;
};

const safeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
};

export const fetchEvents = async (): Promise<TrackdayEvent[]> => {
  const res = await safeFetch(`${BASE_URL}/events`);
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch events'));
  return res.json() as Promise<TrackdayEvent[]>;
};

export const fetchParticipants = async (): Promise<Participant[]> => {
  const res = await safeFetch(`${BASE_URL}/participants`);
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch participants'));
  return res.json() as Promise<Participant[]>;
};

export const removeAttendeeFromGroup = async (
  eventId: number,
  skillLevel: SkillLevel,
): Promise<TrackdayEvent[]> => {
  const res = await safeFetch(
    `${BASE_URL}/events/${eventId}/groups/${encodeURIComponent(skillLevel)}/attendees/self`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Failed to remove attendee'));
  }
  return res.json() as Promise<TrackdayEvent[]>;
};

export const addAttendeeToGroup = async (
  eventId: number,
  skillLevel: SkillLevel,
  _accessToken: string,
): Promise<TrackdayEvent[]> => {
  const res = await safeFetch(
    `${BASE_URL}/events/${eventId}/groups/${encodeURIComponent(skillLevel)}/attendees`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Failed to add attendee'));
  }

  return res.json() as Promise<TrackdayEvent[]>;
};
export const createEvent = async (
  payload: CreateEventInput,
): Promise<TrackdayEvent[]> => {
  const res = await safeFetch(`${BASE_URL}/createevent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Failed to create event'));
  }

  return res.json() as Promise<TrackdayEvent[]>;
};

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  picture?: string;
}

export function loginWithFacebook() {
  window.location.href = `${ROOT_URL}/auth/facebook`;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await safeFetch(`${ROOT_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch current user'));

  return res.json();
}

export async function logout() {
  return safeFetch(`${ROOT_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
