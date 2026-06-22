import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Button,
  Avatar,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import type { TrackdayEvent, SkillLevel } from '../types';
import AddAttendeeDialog from './AddAttendeeDialog';

const skillLevelGradient: Record<SkillLevel, string> = {
  Novice: 'linear-gradient(135deg, #059669, #34d399)',
  Intermediate: 'linear-gradient(135deg, #b45309, #fbbf24)',
  Advanced: 'linear-gradient(135deg, #b91c1c, #f87171)',
  CB500: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
};

interface EventItemProps {
  event: TrackdayEvent;
  onAddAttendee: (eventId: number, skillLevel: SkillLevel) => void;
  onRemoveAttendee: (eventId: number, skillLevel: SkillLevel) => void;
  canAddAttendee: boolean;
  currentUserId?: string;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  onAddAttendee,
  onRemoveAttendee,
  canAddAttendee,
  currentUserId,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const headingText = event.organiser ? `${event.organiser}: ${event.venue}` : event.title;
  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const totalAttendees = event.groups.reduce((sum, g) => sum + g.attendees.length, 0);
  const isDay = event.timeOfDay === 'Day';
  const isAlreadyAttending = Boolean(
    currentUserId &&
      event.groups.some((group) =>
        group.attendees.some((attendee) => attendee.userId === currentUserId),
      ),
  );
  const canAddForEvent = canAddAttendee && !isAlreadyAttending;

  return (
    <Accordion
      sx={{
        borderLeft: isDay
          ? '2px solid rgba(251,191,36,0.55)'
          : '2px solid rgba(129,140,248,0.55)',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 20 }} />}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flex: 1, pr: { xs: 0.5, sm: 2 }, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography
                variant="h6"
                component="span"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
              >
                {headingText}
              </Typography>
              <Chip
                icon={
                  isDay
                    ? <WbSunnyIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />
                    : <NightsStayIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />
                }
                label={event.timeOfDay}
                size="small"
                sx={{
                  background: isDay
                    ? 'linear-gradient(135deg, #d97706, #fbbf24)'
                    : 'linear-gradient(135deg, #4f46e5, #818cf8)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                  border: 'none',
                  '& .MuiChip-icon': { marginLeft: '6px' },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {event.venue}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {event.groups.map((group) => (
              <Chip
                key={group.id}
                label={group.skillLevel}
                size="small"
                sx={{
                  background: skillLevelGradient[group.skillLevel],
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  height: 22,
                  border: 'none',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              />
            ))}
            <Chip
              label={`${totalAttendees} ${totalAttendees === 1 ? 'attendee' : 'attendees'}`}
              size="small"
              sx={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {event.groups.map((group) => (
            <Box key={group.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Chip
                  label={group.skillLevel}
                  size="small"
                  sx={{
                    background: skillLevelGradient[group.skillLevel],
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    height: 22,
                    border: 'none',
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                  {group.attendees.length} {group.attendees.length === 1 ? 'participant' : 'participants'}
                </Typography>
              </Box>
              {group.attendees.length > 0 ? (
                <List dense disablePadding sx={{ pl: 0.5 }}>
                  {[...group.attendees]
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
                    .map((attendee, index) => (
                    <ListItem
                      key={attendee.userId ?? `${attendee.name}-${index}`}
                      disableGutters
                      sx={{
                        py: 0.5,
                        px: 1,
                        borderRadius: '8px',
                        mb: 0.25,
                        '&:hover': { background: 'rgba(255,255,255,0.04)' },
                      }}
                    >
                      <Avatar
                        src={attendee.picture}
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background: 'rgba(129,140,248,0.15)',
                          color: '#a5b4fc',
                          mr: 1.5,
                          border: '1px solid rgba(129,140,248,0.2)',
                        }}
                      >
                        {getInitials(attendee.name)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}
                          >
                            {attendee.name}
                          </Typography>
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={() => onRemoveAttendee(event.id, group.skillLevel)}
                        sx={{
                          ml: 'auto',
                          color: 'rgba(255,255,255,0.2)',
                          width: 26,
                          height: 26,
                          flexShrink: 0,
                          '&:hover': {
                            color: '#f87171',
                            background: 'rgba(248,113,113,0.12)',
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.2)', pl: 0.5, fontStyle: 'italic' }}
                >
                  No participants yet
                </Typography>
              )}
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon sx={{ fontSize: '15px !important' }} />}
            onClick={() => {
              if (!canAddForEvent) return;
              setDialogOpen(true);
            }}
            disabled={!canAddForEvent}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 2,
              py: 0.75,
              boxShadow: '0 4px 15px rgba(99,102,241,0.25)',
              border: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
              },
              '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)',
                boxShadow: 'none',
              },
            }}
          >
            Add Participant
          </Button>
          {!canAddForEvent && (
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.35)' }}
            >
              {isAlreadyAttending
                ? 'You are already attending this event'
                : 'Sign in to add yourself to this event'}
            </Typography>
          )}
        </Box>
      </AccordionDetails>
      <AddAttendeeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={(skillLevel) => onAddAttendee(event.id, skillLevel)}
        event={event}
      />
    </Accordion>
  );
};

interface EventListProps {
  events: TrackdayEvent[];
  onAddAttendee: (eventId: number, skillLevel: SkillLevel) => void;
  onRemoveAttendee: (eventId: number, skillLevel: SkillLevel) => void;
  canAddAttendee: boolean;
  currentUserId?: string;
}

const EventList: React.FC<EventListProps> = ({
  events,
  onAddAttendee,
  onRemoveAttendee,
  canAddAttendee,
  currentUserId,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          onAddAttendee={onAddAttendee}
          onRemoveAttendee={onRemoveAttendee}
          canAddAttendee={canAddAttendee}
          currentUserId={currentUserId}
        />
      ))}
    </Box>
  );
};

export default EventList;
