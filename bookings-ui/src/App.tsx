
import React, { useState, useEffect, useMemo } from 'react';
import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes, Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import EventList from './components/EventList';
import CreateEventDialog from './components/CreateEventDialog';
import { fetchEvents, fetchParticipants, addAttendeeToGroup, removeAttendeeFromGroup, createEvent } from './api/api';
import type { TrackdayEvent, SkillLevel, Participant } from './types';

const rawTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#818cf8', light: '#a5b4fc', dark: '#6366f1' },
    secondary: { main: '#22d3ee' },
    background: { default: '#07070f', paper: '#0f0f1a' },
    success: { main: '#34d399' },
    warning: { main: '#fbbf24' },
    error: { main: '#f87171' },
    text: { primary: '#e2e8f0', secondary: '#94a3b8' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.03em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#2d2d44 transparent',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '6px',
            backgroundColor: '#2d2d44',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.035)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '18px !important',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: '0 !important' },
          transition: 'box-shadow 0.2s ease, background 0.2s ease',
          '&:hover': {
            background: 'rgba(255,255,255,0.055)',
            boxShadow: '0 8px 40px rgba(99,102,241,0.12), 0 4px 24px rgba(0,0,0,0.25)',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '18px 22px',
          minHeight: '68px',
          '@media (max-width:600px)': { padding: '14px 16px', minHeight: '60px' },
        },
        content: { margin: '0 !important' },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 22px 22px',
          '@media (max-width:600px)': { padding: '0 16px 18px' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.01em',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(10,10,20,0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.1)',
          },
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(129,140,248,0.4)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&:hover': { background: 'rgba(129,140,248,0.1)' },
          '&.Mui-selected': { background: 'rgba(129,140,248,0.18)' },
          '&.Mui-selected:hover': { background: 'rgba(129,140,248,0.25)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, letterSpacing: '0.02em' },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(255,255,255,0.06)' } },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.1rem' },
      },
    },
  },
});

const theme = responsiveFontSizes(rawTheme, { factor: 2 });

const App: React.FC = () => {
  const [events, setEvents] = useState<TrackdayEvent[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [latestFirst, setLatestFirst] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchParticipants()])
      .then(([evts, parts]) => {
        setEvents(evts);
        setParticipants(parts);
        setError(null);
      })
      .catch(() => setError('Could not connect to the server. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddAttendee = async (
    eventId: number,
    skillLevel: SkillLevel,
    participantId: number,
  ) => {
    try {
      const updated = await addAttendeeToGroup(eventId, skillLevel, participantId);
      setEvents(updated);
    } catch (err) {
      console.error('Failed to add attendee:', err);
    }
  };

  const handleRemoveAttendee = async (
    eventId: number,
    skillLevel: SkillLevel,
    attendeeId: number,
  ) => {
    try {
      const updated = await removeAttendeeFromGroup(eventId, skillLevel, attendeeId);
      setEvents(updated);
    } catch (err) {
      console.error('Failed to remove attendee:', err);
    }
  };

  const handleCreateEvent = async (payload: {
    venue: string;
    date: string;
    timeOfDay: 'Day' | 'Evening';
    organiser: string;
    groups: SkillLevel[];
  }) => {
    try {
      const updated = await createEvent(payload);
      setEvents(updated);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const totalParticipants = new Set(
    events.flatMap(e => e.groups.flatMap(g => g.attendees.map(a => a.name)))
  ).size;

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return latestFirst ? bTime - aTime : aTime - bTime;
    });
  }, [events, latestFirst]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background:
            'radial-gradient(ellipse at 15% 15%, rgba(99,102,241,0.1) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(34,211,238,0.05) 0%, transparent 55%), #07070f',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ pt: { xs: 3, sm: 6 }, pb: { xs: 4, sm: 8 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: '#818cf8',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  fontSize: '0.7rem',
                  display: 'block',
                }}
              >
                Trackday Calendar
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  minWidth: 38,
                  width: 38,
                  height: 38,
                  px: 0,
                  borderRadius: '10px',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #14b8a6, #22d3ee)',
                  color: '#022c22',
                  fontWeight: 800,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d9488, #06b6d4)',
                  },
                }}
              >
                +
              </Button>
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #c7d2fe 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5,
              }}
            >
              CB500 is life!
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.3)', mb: 4, fontWeight: 500 }}
            >
              {events.length} events · {totalParticipants} participants
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => setLatestFirst((prev) => !prev)}
                  sx={{
                    borderColor: 'rgba(129,140,248,0.5)',
                    color: '#c7d2fe',
                    '&:hover': {
                      borderColor: '#818cf8',
                      background: 'rgba(129,140,248,0.08)',
                    },
                  }}
                >
                  {latestFirst ? 'Showing latest first' : 'Showing earliest first'}
                </Button>
              </Box>
            </Box>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#818cf8' }} />
              </Box>
            )}
            {error && (
              <Alert
                severity="error"
                sx={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  color: '#fca5a5',
                  borderRadius: '12px',
                  mb: 2,
                  '& .MuiAlert-icon': { color: '#f87171' },
                }}
              >
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <EventList
                events={sortedEvents}
                allParticipants={participants}
                onAddAttendee={handleAddAttendee}
                onRemoveAttendee={handleRemoveAttendee}
              />
            )}
            <CreateEventDialog
              open={createDialogOpen}
              onClose={() => setCreateDialogOpen(false)}
              onCreate={handleCreateEvent}
            />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
