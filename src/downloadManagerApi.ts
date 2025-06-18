import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import { TorrentServer, Torrent } from './types';

export const downloadManagerApi = createApi({
  reducerPath: 'clarion-app-downloads-api',
  baseQuery: baseQuery(),
  tagTypes: ['TorrentServer', 'Torrent'],
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
    
    // Torrent endpoints
    getTorrents: builder.query<Torrent[], void>({
      query: () => '/torrents',
      providesTags: ['Torrent'],
    }),
    getTorrent: builder.query<Torrent, string>({
      query: (id) => `/torrents/${id}`,
      providesTags: ['Torrent'],
    }),
    createTorrent: builder.mutation<Torrent, Partial<Torrent>>({
      query: (torrent) => ({
        url: '/torrents',
        method: 'POST',
        body: torrent,
      }),
      invalidatesTags: ['Torrent'],
    }),
    updateTorrent: builder.mutation<Torrent, { id: string; torrent: Partial<Torrent> }>({
      query: ({ id, torrent }) => ({
        url: `/torrents/${id}`,
        method: 'PUT',
        body: torrent,
      }),
      invalidatesTags: ['Torrent'],
    }),
    deleteTorrent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/torrents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Torrent'],
    }),
    markTorrentIncomplete: builder.mutation<Torrent, string>({
      query: (id) => ({
        url: `/torrents/${id}/mark-incomplete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Torrent'],
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
  useGetTorrentsQuery,
  useGetTorrentQuery,
  useCreateTorrentMutation,
  useUpdateTorrentMutation,
  useDeleteTorrentMutation,
  useMarkTorrentIncompleteMutation,
} = downloadManagerApi;
