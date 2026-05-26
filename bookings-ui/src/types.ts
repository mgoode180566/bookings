export type TimeOfDay = 'Day' | 'Evening';

export interface Participant {
  id: number;
  name: string;
}

export type SkillLevel = 'Novice' | 'Intermediate' | 'Advanced';

export interface Attendee {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  skillLevel: SkillLevel;
  attendees: Attendee[];
}

export interface TrackdayEvent {
  id: number;
  title: string;
  venue: string;
  date: string; // ISO date string
  timeOfDay: TimeOfDay;
  groups: Group[];
}
