import express, { Request, Response } from 'express';
import cors from 'cors';
import type { SkillLevel } from './types';
import { readEvents, readParticipants, writeEvents } from './storage';
import { AuthenticatedRequest, requireAuth } from './auth';
// import { readEvents, writeEvents, readParticipants } from './storage';

const ALLOWED_SKILL_LEVELS: SkillLevel[] = ['Novice', 'Intermediate', 'Advanced', 'CB500'];

interface CreateEventRequestBody {
  venue: string;
  date: string;
  timeOfDay: 'Day' | 'Evening';
  organiser: string;
  groups: SkillLevel[];
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.sendStatus(200);
});

app.get('/api/message', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from the other side!' });
});

// GET /api/events
app.get('/api/events', async (_req: Request, res: Response) => {
  try {
    const events = await readEvents();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// GET /api/participants
app.get('/api/participants', async (_req: Request, res: Response) => {
  try {
    const participants = await readParticipants();
    res.json(participants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load participants' });
  }
});

// POST /api/createevent
app.post('/api/createevent', async (req: Request, res: Response) => {
  try {
    const { venue, date, timeOfDay, organiser, groups } =
      req.body as CreateEventRequestBody;

    if (!venue || typeof venue !== 'string') {
      res.status(400).json({ error: 'Venue is required' });
      return;
    }

    if (!date || typeof date !== 'string' || Number.isNaN(Date.parse(date))) {
      res.status(400).json({ error: 'Valid date is required' });
      return;
    }

    if (timeOfDay !== 'Day' && timeOfDay !== 'Evening') {
      res.status(400).json({ error: 'Time of day must be Day or Evening' });
      return;
    }

    if (!organiser || typeof organiser !== 'string') {
      res.status(400).json({ error: 'Organiser is required' });
      return;
    }

    if (!Array.isArray(groups) || groups.length === 0) {
      res.status(400).json({ error: 'At least one group is required' });
      return;
    }

    const uniqueGroups = [...new Set(groups)];

    if (
      uniqueGroups.some(
        (group) =>
          typeof group !== 'string' || !ALLOWED_SKILL_LEVELS.includes(group as SkillLevel),
      )
    ) {
      res.status(400).json({ error: 'Groups must be Novice, Intermediate, Advanced or CB500' });
      return;
    }

    const events = await readEvents();
    const nextEventId = events.length > 0 ? Math.max(...events.map((event) => event.id)) + 1 : 1;
    const maxGroupId =
      events.length > 0
        ? Math.max(
            0,
            ...events.flatMap((event) => event.groups.map((group) => group.id)),
          )
        : 0;

    const newEvent = {
      id: nextEventId,
      title: `${organiser} ${venue}`,
      venue,
      organiser,
      date,
      timeOfDay,
      groups: uniqueGroups.map((skillLevel, index) => ({
        id: maxGroupId + index + 1,
        skillLevel,
        attendees: [],
      })),
    };

    const updatedEvents = [...events, newEvent];
    await writeEvents(updatedEvents);

    res.status(201).json(updatedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// POST /api/events/:eventId/groups/:skillLevel/attendees
app.post(
  '/api/events/:eventId/groups/:skillLevel/attendees',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.eventId);
      const skillLevel = req.params.skillLevel as SkillLevel;

      const userId = req.user!.sub;
      const userName = req.user!.username ?? req.user!.email ?? userId;

      const events = await readEvents();
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
        g.attendees.some((a) => a.userId === userId),
      );

      if (alreadyBooked) {
        res.status(409).json({
          error: 'You are already booked on this event',
        });
        return;
      }

      group.attendees.push({
        userId: userId,
        name: userName,
      });

      await writeEvents(events);

      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add attendee' });
    }
  },
);

// DELETE /api/events/:eventId/groups/:skillLevel/attendees/self
app.delete(
  '/api/events/:eventId/groups/:skillLevel/attendees/self',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const eventId = Number(req.params.eventId);
      const skillLevel = req.params.skillLevel as SkillLevel;
      const userId = req.user!.sub;

      const events = await readEvents();
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

      const idx = group.attendees.findIndex((a) => a.userId === userId);

      if (idx === -1) {
        res.status(404).json({ error: 'Attendee not found' });
        return;
      }

      group.attendees.splice(idx, 1);

      await writeEvents(events);

      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to remove attendee' });
    }
  },
);

export default app;
