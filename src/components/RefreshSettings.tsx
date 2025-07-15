import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

interface RefreshSettingsProps {
  refreshTime: number;
  onRefreshTimeChange: (time: number) => void;
}

const RefreshSettings: React.FC<RefreshSettingsProps> = ({ refreshTime, onRefreshTimeChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Math.max(5, parseInt(e.target.value) || 30);
    onRefreshTimeChange(newTime);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="body2" color={'#333'}>
        Refresh every:
      </Typography>
      <TextField
        type="number"
        size="small"
        value={refreshTime}
        onChange={handleChange}
        sx={{
          width: 80,
        }}
        slotProps={{
          input: {
            inputProps: {
              min: 5,
              max: 300,
              style: { textAlign: 'center' }
            }
          }
        }}
      />
      <Typography variant="body2" sx={{ color: '#333' }}>
        seconds
      </Typography>
    </Box>
  );
};

export default RefreshSettings; 