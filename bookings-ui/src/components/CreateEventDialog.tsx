import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  OutlinedInput,
  ListItemText,
  Checkbox,
  TextField,
  type SelectChangeEvent,
} from '@mui/material';
import type { SkillLevel } from '../types';
import type { CreateEventInput } from '../api/api';

const VENUES = [
  'Brands Hatch GP',
  'Brands Hatch Indy',
  'Cadwell Park',
  'Castle Coombe',
  'Croft',
  'Darley Moor',
  'Donington International',
  'Donington National',
  'Knockhill',
  'Mallory Park',
  'Mallory Park Oval',
  'Oulton Park',
  'Snetterton 100',
  'Snetterton 200',
  'Snetterton 300',
  'Three Sisters',
  'Thruxton'
] as const;

const ORGANISERS = ['No Limits', 'MSV', 'Other'] as const;
const SKILL_LEVELS: SkillLevel[] = ['Novice', 'Intermediate', 'Advanced', 'CB500'];

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateEventInput) => Promise<void>;
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'Day' | 'Evening' | ''>('');
  const [organiser, setOrganiser] = useState('');
  const [groups, setGroups] = useState<SkillLevel[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = () => {
    setVenue('');
    setDate('');
    setTimeOfDay('');
    setOrganiser('');
    setGroups([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!venue || !date || !timeOfDay || !organiser || groups.length === 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        venue,
        date,
        timeOfDay,
        organiser,
        groups,
      });
      resetAndClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 0.5 }}>
        Create Event
        <Typography
          variant="caption"
          sx={{ display: 'block', color: 'text.secondary', fontWeight: 400, mt: 0.25 }}
        >
          Add a new event to the active schedule
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="create-venue-label">Venue</InputLabel>
            <Select
              labelId="create-venue-label"
              label="Venue"
              value={venue}
              onChange={(e: SelectChangeEvent) => setVenue(e.target.value)}
            >
              {VENUES.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="create-time-label">Time of day</InputLabel>
            <Select
              labelId="create-time-label"
              label="Time of day"
              value={timeOfDay}
              onChange={(e: SelectChangeEvent) =>
                setTimeOfDay(e.target.value as 'Day' | 'Evening')
              }
            >
              <MenuItem value="Day">Day</MenuItem>
              <MenuItem value="Evening">Evening</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="create-organiser-label">Organiser</InputLabel>
            <Select
              labelId="create-organiser-label"
              label="Organiser"
              value={organiser}
              onChange={(e: SelectChangeEvent) => setOrganiser(e.target.value)}
            >
              {ORGANISERS.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="create-groups-label">Groups</InputLabel>
            <Select
              labelId="create-groups-label"
              multiple
              value={groups}
              onChange={(e) => setGroups(e.target.value as SkillLevel[])}
              input={<OutlinedInput label="Groups" />}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {SKILL_LEVELS.map((level) => (
                <MenuItem key={level} value={level}>
                  <Checkbox checked={groups.includes(level)} />
                  <ListItemText primary={level} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            submitting || !venue || !date || !timeOfDay || !organiser || groups.length === 0
          }
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            fontWeight: 600,
            '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
            '&.Mui-disabled': {
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.25)',
            },
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventDialog;
