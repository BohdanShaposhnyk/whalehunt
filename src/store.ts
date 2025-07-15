import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Define the query parameters interface
interface GetActionsParams {
  limit?: number;
  asset?: string;
  type?: string;
}

// FIFO buffer for the last 50 unique swaps
const MAX_SWAPS = 50;
let swapBuffer: any[] = [];
let previousTxids = new Set<string>();

// RTK Query API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://vanaheimex.com/' }),
  endpoints: (builder) => ({
    getActions: builder.query({
      query: (params: GetActionsParams = {}) => {
        const { limit = 10, asset = 'THOR.RUJI', type = 'swap' } = params;
        return `actions?limit=${limit}&asset=${encodeURIComponent(asset)}&type=${encodeURIComponent(type)}`;
      },
      transformResponse: (response: any) => {
        // Support different response shapes
        const actions: any[] = Array.isArray(response)
          ? response
          : response?.actions || response?.data || [];

        const newActions: any[] = [];

        // Add new unique actions to the buffer (maintain API order: newest first)
        for (const action of actions.reverse()) { // Process in reverse to maintain correct order
          const txid = action?.in?.[0]?.txID;
          if (txid) {
            const existingIndex = swapBuffer.findIndex(bufAction => bufAction?.in?.[0]?.txID === txid);

            if (existingIndex !== -1) {
              // Update existing action (e.g., status change from pending to success)
              const actionWithMetadata = {
                ...action,
                _isNew: false, // Not new, just updated
                _txid: txid
              };
              swapBuffer[existingIndex] = actionWithMetadata;
            } else {
              // Add new unique action
              const actionWithMetadata = {
                ...action,
                _isNew: !previousTxids.has(txid), // Track if this is truly new
                _txid: txid
              };
              swapBuffer.unshift(actionWithMetadata); // Add to beginning (newest first)
              if (!previousTxids.has(txid)) {
                newActions.push(actionWithMetadata);
              }
            }
          }
        }

        // Maintain FIFO: if buffer exceeds limit, remove oldest entries (from end)
        while (swapBuffer.length > MAX_SWAPS) {
          swapBuffer.pop(); // Remove oldest (last) entry
        }

        // Update previous txids for next comparison
        previousTxids = new Set(swapBuffer.map(action => action._txid));

        // Return buffer as-is (newest first, oldest last)
        return [...swapBuffer];
      },
    }),
  }),
});

// Highlight limits slice for managing whale detection thresholds
const highlightLimitsSlice = createSlice({
  name: 'highlightLimits',
  initialState: {
    value: { greenRed: 10000, blueYellow: 5000 }
  },
  reducers: {
    setHighlightLimits: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Refresh time slice for managing polling interval
const refreshTimeSlice = createSlice({
  name: 'refreshTime',
  initialState: {
    value: 30
  },
  reducers: {
    setRefreshTime: (state, action) => {
      state.value = Math.max(5, Math.min(300, action.payload)); // Clamp between 5 and 300 seconds
    },
  },
});

export const { setHighlightLimits } = highlightLimitsSlice.actions;
export const { setRefreshTime } = refreshTimeSlice.actions;

// Create persisted reducers
const persistedHighlightLimits = persistReducer(
  { key: 'highlightLimits', storage },
  highlightLimitsSlice.reducer
);

const persistedRefreshTime = persistReducer(
  { key: 'refreshTime', storage },
  refreshTimeSlice.reducer
);

export const store = configureStore({
  reducer: {
    highlightLimits: persistedHighlightLimits,
    refreshTime: persistedRefreshTime,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the auto-generated hooks
export const { useGetActionsQuery } = apiSlice; 