export type TimeOfDay = 'Day' | 'Evening';
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
  date: string;
  timeOfDay: TimeOfDay;
  groups: Group[];
}

export interface Participant {
  id: number;
  name: string;
}
