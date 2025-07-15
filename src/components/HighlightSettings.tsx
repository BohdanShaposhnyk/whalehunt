import React, { useState } from 'react';
import type { HighlightLimits } from '../utils/swapUtils';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

interface HighlightSettingsProps {
  limits: HighlightLimits;
  onChange: (limits: HighlightLimits) => void;
}

const HighlightSettings: React.FC<HighlightSettingsProps> = ({ limits, onChange }) => {
  const [localLimits, setLocalLimits] = useState(limits);

  const handleChange = (field: keyof HighlightLimits) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const newLimits = { ...localLimits, [field]: value };
    setLocalLimits(newLimits);
    onChange(newLimits);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Typography variant="body2" color={'#333'}>
        Trigger at:
      </Typography>
      <TextField
        label="Whale"
        type="number"
        size="small"
        value={localLimits.greenRed}
        onChange={handleChange('greenRed')}
        sx={{ width: '30%' }}
        inputProps={{ min: 0 }}
      />
      <TextField
        label="Dolphin"
        type="number"
        size="small"
        value={localLimits.blueYellow}
        onChange={handleChange('blueYellow')}
        sx={{ width: '30%' }}
        inputProps={{ min: 0 }}
      />
    </Box>
  );
};

export default HighlightSettings; 