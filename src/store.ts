import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// RTK Query API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getActions: builder.query({
      query: () => 'actions',
    }),
    getSettings: builder.query({
      query: () => 'settings',
    }),
    updateSettings: builder.mutation({
      query: (settings) => ({
        url: 'settings',
        method: 'POST',
        body: settings,
      }),
    }),
    getTelegramConfig: builder.query({
      query: () => 'telegram/config',
    }),
    updateTelegramConfig: builder.mutation({
      query: (config) => ({
        url: 'telegram/config',
        method: 'POST',
        body: config,
      }),
    }),
    testTelegram: builder.query({
      query: () => 'telegram/test',
    }),
  }),
});

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the auto-generated hooks
export const { useGetActionsQuery, useGetSettingsQuery, useUpdateSettingsMutation, useGetTelegramConfigQuery, useUpdateTelegramConfigMutation, useTestTelegramQuery } = apiSlice; 