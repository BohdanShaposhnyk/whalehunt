import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useGetActionsQuery, useGetSettingsQuery } from '../store';
import ActionItem from './ActionItem';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeColors } from '../theme/colors';
import { unlockAudioContext } from '../utils/audioUtils';

function ActionsList() {
    const { data: settings } = useGetSettingsQuery(undefined);
    const pollingInterval = settings?.pollingInterval ? settings.pollingInterval * 1000 : 30000;
    const { data, isLoading, error } = useGetActionsQuery(undefined, { pollingInterval });
    const actions = data || [];

    useEffect(() => {
        const handleUserGesture = () => {
            unlockAudioContext();
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
        };
        window.addEventListener('click', handleUserGesture);
        window.addEventListener('keydown', handleUserGesture);
        return () => {
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
        };
    }, []);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" minWidth="50vw">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" minWidth="50vw">
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to fetch actions
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            p={2}
            flexDirection="column"
            alignItems="center"
            justifyContent="stretch"
            height="100vh"
            overflow="auto"
            bgcolor={themeColors.primary}
            boxSizing="border-box"
        >
            <Typography variant="h5" gutterBottom sx={{ color: themeColors.textPrimary }}>
                Catch the Whale!
            </Typography>
            {actions.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                    No actions found
                </Typography>
            ) : (
                <Box width="100%">
                    <AnimatePresence initial={false}>
                        {actions.map((action: any, index: number) => (
                            <motion.div
                                key={action._txid || index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5 }}
                            >
                                <ActionItem
                                    action={action}
                                    isNew={action._isNew}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </Box>
            )}
        </Box>
    );
}

export default ActionsList; 