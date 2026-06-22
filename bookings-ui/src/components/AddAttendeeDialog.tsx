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

interface AddAttendeeDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (skillLevel: SkillLevel) => void;
  event: TrackdayEvent;
}

const AddAttendeeDialog: React.FC<AddAttendeeDialogProps> = ({
  open,
  onClose,
  onAdd,
  event,
}) => {
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');

  const fullScreen = useMediaQuery('(max-width:600px)');
  const eventSkillLevels = event.groups.map((group) => group.skillLevel);

  const handleAdd = () => {
    if (skillLevel) {
      onAdd(skillLevel);
      setSkillLevel('');
      onClose();
    }
  };

  const handleClose = () => {
    setSkillLevel('');
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
              {eventSkillLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
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
          disabled={!skillLevel}
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
          Add Me
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAttendeeDialog;
