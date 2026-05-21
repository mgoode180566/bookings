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
  useMediaQuery,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { TrackdayEvent, SkillLevel } from '../types';
import type { Participant } from '../types';

const SKILL_LEVELS: SkillLevel[] = ['Novice', 'Intermediate', 'Advanced'];

interface AddAttendeeDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (skillLevel: SkillLevel, participantId: number) => void;
  event: TrackdayEvent;
  allParticipants: Participant[];
}

const AddAttendeeDialog: React.FC<AddAttendeeDialogProps> = ({
  open,
  onClose,
  onAdd,
  event,
  allParticipants,
}) => {
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');
  const [participantId, setParticipantId] = useState<number | ''>('');

  const fullScreen = useMediaQuery('(max-width:600px)');

  const bookedIds = new Set(event.groups.flatMap((g) => g.attendees.map((a) => a.id)));
  const availableParticipants = allParticipants.filter((p) => !bookedIds.has(p.id));

  const handleAdd = () => {
    if (skillLevel && participantId !== '') {
      onAdd(skillLevel, participantId as number);
      setSkillLevel('');
      setParticipantId('');
      onClose();
    }
  };

  const handleClose = () => {
    setSkillLevel('');
    setParticipantId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" fullScreen={fullScreen}>
      <DialogTitle sx={{ pb: 0.5 }}>
        Add Participant
        <Typography
          variant="caption"
          sx={{ display: 'block', color: 'text.secondary', fontWeight: 400, mt: 0.25 }}
        >
          {event.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="group-label">Group</InputLabel>
            <Select
              labelId="group-label"
              label="Group"
              value={skillLevel}
              onChange={(e: SelectChangeEvent) => setSkillLevel(e.target.value as SkillLevel)}
            >
              {SKILL_LEVELS.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="participant-label">Participant</InputLabel>
            <Select
              labelId="participant-label"
              label="Participant"
              value={participantId}
              onChange={(e: SelectChangeEvent<number>) =>
                setParticipantId(e.target.value as number)
              }
              disabled={availableParticipants.length === 0}
            >
              {availableParticipants.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!skillLevel || participantId === ''}
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
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAttendeeDialog;
