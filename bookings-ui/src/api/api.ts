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

const getAccessToken = (): string => {
  const token = localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Missing access token. Please sign in again.');
  }
  return token;
};

export const fetchEvents = async (): Promise<TrackdayEvent[]> => {
  const res = await fetch(`${BASE_URL}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json() as Promise<TrackdayEvent[]>;
};

export const fetchParticipants = async (): Promise<Participant[]> => {
  const res = await fetch(`${BASE_URL}/participants`);
  if (!res.ok) throw new Error('Failed to fetch participants');
  return res.json() as Promise<Participant[]>;
};

export const removeAttendeeFromGroup = async (
  eventId: number,
  skillLevel: SkillLevel,
): Promise<TrackdayEvent[]> => {
  const accessToken = getAccessToken();
  const res = await fetch(
    `${BASE_URL}/events/${eventId}/groups/${encodeURIComponent(skillLevel)}/attendees/self`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error);
  }
  return res.json() as Promise<TrackdayEvent[]>;
};

export const addAttendeeToGroup = async (
  eventId: number,
  skillLevel: SkillLevel,
  accessToken: string,
): Promise<TrackdayEvent[]> => {
  const res = await fetch(
    `${BASE_URL}/events/${eventId}/groups/${encodeURIComponent(skillLevel)}/attendees`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error);
  }

  return res.json() as Promise<TrackdayEvent[]>;
};
export const createEvent = async (
  payload: CreateEventInput,
): Promise<TrackdayEvent[]> => {
  const res = await fetch(`${BASE_URL}/createevent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error);
  }

  return res.json() as Promise<TrackdayEvent[]>;
};
