import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import { LaravelModelType } from '@clarion-app/types';
import { TorrentServer } from './types';

export interface MessageType extends LaravelModelType {
  to: string;
  from: string;
  message: string;
}

export const downloadsApi = createApi({
  reducerPath: 'clarion-app-downloads-api',
  baseQuery: baseQuery(),
  tagTypes: ['Message', 'TorrentServer'],
  endpoints: (builder) => ({
    getMessages: builder.query<MessageType[], void>({
      query: () => '/messages',
      providesTags: ['Message'],
    }),
    getMessage: builder.query<MessageType, string>({
      query: (id) => `/messages/${id}`,
      providesTags: ['Message'],
    }),
    createMessage: builder.mutation<MessageType, Partial<MessageType>>({
      query: (message) => ({
        url: '/messages',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),
    updateMessage: builder.mutation<MessageType, { id: string; message: Partial<MessageType> }>({
      query: ({ id, message }) => ({
        url: `/messages/${id}`,
        method: 'PUT',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),
    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),
    
    // TorrentServer endpoints
    getTorrentServers: builder.query<{ servers: TorrentServer[], clientTypes: string[] }, void>({
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
    getClientTypes: builder.query<string[], void>({
      query: () => '/torrent-servers/client-types',
    }),
  }),
});

// Extract hooks
export const {
  useGetMessagesQuery,
  useGetMessageQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useGetTorrentServersQuery,
  useGetTorrentServerQuery,
  useCreateTorrentServerMutation,
  useUpdateTorrentServerMutation,
  useDeleteTorrentServerMutation,
  useGetClientTypesQuery,
} = downloadsApi;
