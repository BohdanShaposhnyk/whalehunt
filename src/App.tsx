import './App.css';
import Box from '@mui/material/Box';
import ActionsList from './components/ActionsList';
import SettingsPanel from './components/SettingsPanel';
import AudioTestPanel from './components/AudioTestPanel';
import TelegramSettings from './components/TelegramSettings';
import BackgroundWrapper from './components/BackgroundWrapper';

function App() {
  return (
    <>
      <BackgroundWrapper />
      <Box
        display="flex"
        flexDirection="row"
        minHeight="100vh"
        minWidth="100vw"
        width="100vw"
        boxSizing="border-box"
        gap={2}
      >
        {/* Left: ActionsList (50%) */}
        <Box flex={1} minWidth={0}>
          <ActionsList />
        </Box>
        {/* Right: Telegram + Settings/Audio */}
        <Box
          flex={1}
          display="flex"
          flexDirection="row"
          minWidth={0}
          justifyContent="flex-start"
          pt={2}
          pb={2}
          pr={2}
          gap={2}
        >
          {/* TelegramSettings (left half of right panel) */}
          <Box flex={1} minWidth={0} display="flex" alignItems="stretch" height="fit-content">
            <TelegramSettings />
          </Box>
          {/* SettingsPanel + AudioTestPanel (right half of right panel, stacked) */}
          <Box flex={1} minWidth={0} display="flex" flexDirection="column" gap={2} height="fit-content">
            <SettingsPanel />
            <AudioTestPanel />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
