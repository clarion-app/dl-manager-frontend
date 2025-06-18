import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import { TorrentServer } from './types';

export const downloadManagerApi = createApi({
  reducerPath: 'clarion-app-downloads-api',
  baseQuery: baseQuery(),
  tagTypes: ['TorrentServer'],
  endpoints: (builder) => ({
    // TorrentServer endpoints
    getTorrentServers: builder.query<TorrentServer[], void>({
      query: () => '/torrent-servers',
      providesTags: ['TorrentServer'],
    }),
    getTorrentServer: builder.query<TorrentServer, string>({
      query: (id) => `/torrent-servers/${id}`,
      providesTags: ['TorrentServer'],
    }),
    createTorrentServer: builder.mutation<TorrentServer, Partial<TorrentServer>>({
      query: (server) => ({
        url: '/torrent-servers',
        method: 'POST',
        body: server,
      }),
      invalidatesTags: ['TorrentServer'],
    }),
    updateTorrentServer: builder.mutation<TorrentServer, { id: string; server: Partial<TorrentServer> }>({
      query: ({ id, server }) => ({
        url: `/torrent-servers/${id}`,
        method: 'PUT',
        body: server,
      }),
      invalidatesTags: ['TorrentServer'],
    }),
    deleteTorrentServer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/torrent-servers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TorrentServer'],
    }),
    getTorrentClientTypes: builder.query<string[], void>({
      query: () => '/torrent-servers/client-types',
    }),
  }),
});

// Extract hooks
export const {
  useGetTorrentServersQuery,
  useGetTorrentServerQuery,
  useCreateTorrentServerMutation,
  useUpdateTorrentServerMutation,
  useDeleteTorrentServerMutation,
  useGetTorrentClientTypesQuery,
} = downloadManagerApi;
