import './App.css';
import Box from '@mui/material/Box';
import ActionsList from './components/ActionsList';
import SettingsPanel from './components/SettingsPanel';
import AudioTestPanel from './components/AudioTestPanel';
import TelegramSettings from './components/TelegramSettings';
import BackgroundWrapper from './components/BackgroundWrapper';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

function App() {
  const highlightLimits = useSelector((state: RootState) => state.highlightLimits.value);

  return (
    <>
      <BackgroundWrapper />
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="stretch"
        minHeight="100vh"
        minWidth="100%"
        width="100vw"
        boxSizing="border-box"
      >
        <ActionsList
          highlightLimits={highlightLimits}
        />
        <Box
          display="flex"
          flexDirection="column"
          width="50%"
          flexShrink={0}
          padding={2}
          boxSizing="border-box"
        >
          <Box
            display="flex"
            flexDirection="row"
            gap={2}
            marginBottom={2}
          >
            <SettingsPanel />
            <AudioTestPanel />
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            gap={2}
            width="100%"
          >
            <TelegramSettings />
            <Box
              sx={{
                flex: 1,
                width: '100%',
                p: 1.5,
              }}
            ></Box>
          </Box>

        </Box>
      </Box>
    </>
  );
}

export default App;
