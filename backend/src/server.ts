import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import type { TrackdayEvent, Participant, SkillLevel } from './types';

const app = express();
const PORT = 3001;

const EVENTS_FILE = path.join(__dirname, '../data/events.json');
const PARTICIPANTS_FILE = path.join(__dirname, '../data/participants.json');

app.use(cors());
app.use(express.json());

const readEvents = (): TrackdayEvent[] =>
  JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8')) as TrackdayEvent[];

const writeEvents = (events: TrackdayEvent[]): void =>
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));

const readParticipants = (): Participant[] =>
  JSON.parse(fs.readFileSync(PARTICIPANTS_FILE, 'utf-8')) as Participant[];

// GET /api/events
app.get('/api/events', (_req: Request, res: Response) => {
  res.json(readEvents());
});

// GET /api/participants
app.get('/api/participants', (_req: Request, res: Response) => {
  res.json(readParticipants());
});

// POST /api/events/:eventId/groups/:skillLevel/attendees
app.post(
  '/api/events/:eventId/groups/:skillLevel/attendees',
  (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const skillLevel = req.params.skillLevel as SkillLevel;
    const { participantId } = req.body as { participantId: number };

    const participants = readParticipants();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) {
      res.status(404).json({ error: 'Participant not found' });
      return;
    }

    const events = readEvents();
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const group = event.groups.find((g) => g.skillLevel === skillLevel);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const alreadyBooked = event.groups.some((g) =>
      g.attendees.some((a) => a.id === participantId),
    );
    if (alreadyBooked) {
      res.status(409).json({ error: 'Participant already booked on this event' });
      return;
    }

    group.attendees.push({ id: participant.id, name: participant.name });
    writeEvents(events);
    res.json(events);
  },
);

// DELETE /api/events/:eventId/groups/:skillLevel/attendees/:attendeeId
app.delete(
  '/api/events/:eventId/groups/:skillLevel/attendees/:attendeeId',
  (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const skillLevel = req.params.skillLevel as SkillLevel;
    const attendeeId = Number(req.params.attendeeId);

    const events = readEvents();
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const group = event.groups.find((g) => g.skillLevel === skillLevel);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const idx = group.attendees.findIndex((a) => a.id === attendeeId);
    if (idx === -1) {
      res.status(404).json({ error: 'Attendee not found' });
      return;
    }

    group.attendees.splice(idx, 1);
    writeEvents(events);
    res.json(events);
  },
);

app.listen(PORT, () => {
  console.log(`Bookings backend running on http://localhost:${PORT}`);
});
