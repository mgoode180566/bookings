import express, { Request, Response } from 'express';
import cors from 'cors';
import type { SkillLevel } from './types';
import { readEvents, writeEvents, readParticipants } from './storage';

const app = express();


app.use(cors());
app.use(express.json());

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

// POST /api/events/:eventId/groups/:skillLevel/attendees
app.post(
  '/api/events/:eventId/groups/:skillLevel/attendees',
  async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.eventId);
      const skillLevel = req.params.skillLevel as SkillLevel;
      const { participantId } = req.body as { participantId: number };

      const participants = await readParticipants();
      const participant = participants.find((p) => p.id === participantId);

      if (!participant) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }

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
        g.attendees.some((a) => a.id === participantId),
      );

      if (alreadyBooked) {
        res.status(409).json({
          error: 'Participant already booked on this event',
        });
        return;
      }

      group.attendees.push({
        id: participant.id,
        name: participant.name,
      });

      await writeEvents(events);

      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add attendee' });
    }
  },
);

// DELETE /api/events/:eventId/groups/:skillLevel/attendees/:attendeeId
app.delete(
  '/api/events/:eventId/groups/:skillLevel/attendees/:attendeeId',
  async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.eventId);
      const skillLevel = req.params.skillLevel as SkillLevel;
      const attendeeId = Number(req.params.attendeeId);

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

      const idx = group.attendees.findIndex((a) => a.id === attendeeId);

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
