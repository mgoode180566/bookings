export type TimeOfDay = 'Day' | 'Evening';
export type SkillLevel = 'Novice' | 'Intermediate' | 'Advanced' | 'CB500';

export interface Attendee {
  userId: string;
  name: string;
  picture?: string;
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
  organiser?: string;
  date: string;
  timeOfDay: TimeOfDay;
  groups: Group[];
}

export interface Participant {
  id: number;
  name: string;
}
