import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock Echo on window
const mockListen = vi.fn().mockReturnThis();
const mockLeave = vi.fn();
const mockPrivate = vi.fn().mockReturnValue({ listen: mockListen });

function setupEcho() {
  (window as any).Echo = {
    private: mockPrivate,
    leave: mockLeave,
  };
}

// Create a minimal Redux store with loggedInUser
function createTestStore(userId = 'user-123') {
  return configureStore({
    reducer: {
      loggedInUser: (state = { value: { id: userId, name: 'Test', email: 'test@test.com' } }) => state,
      toast: (state = { toasts: [] }, action: any) => {
        if (action.type === 'toast/addToast') {
          return { toasts: [...state.toasts, action.payload] };
        }
        return state;
      },
    },
  });
}

// Dynamic import to allow mocks to be set up first
const { useTorrentNotifications } = await import('../useTorrentNotifications');

describe('useTorrentNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupEcho();
  });

  afterEach(() => {
    // Echo is cleaned up in beforeEach; don't delete it here
    // as hook cleanup may still reference it
  });

  /** T008: subscribes to private User channel and dispatches addToast */
  it('subscribes to private User channel on mount', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useTorrentNotifications(), { wrapper });

    expect(mockPrivate).toHaveBeenCalledWith('User.user-123');
    expect(mockListen).toHaveBeenCalledWith(
      '.ClarionApp\\DownloadManagerBackend\\Events\\TorrentCompletedEvent',
      expect.any(Function),
    );
  });

  /** T008: dispatches addToast on event */
  it('dispatches addToast with torrent name on event', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useTorrentNotifications(), { wrapper });

    // Get the event handler callback
    const eventHandler = mockListen.mock.calls[0][1];

    // Simulate receiving a TorrentCompletedEvent
    eventHandler({
      torrent_id: 'torrent-1',
      name: 'Movie.mkv',
      hash_string: 'abc12345',
      completed_at: '2026-04-04 12:00:00',
    });

    const actions = store.getState().toast.toasts;
    expect(actions).toHaveLength(1);
    expect(actions[0]).toEqual(expect.objectContaining({
      message: expect.stringContaining('Movie.mkv'),
      type: 'success',
      dismissible: true,
    }));
  });

  /** T008: cleans up Echo on unmount */
  it('leaves the channel on unmount', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { unmount } = renderHook(() => useTorrentNotifications(), { wrapper });
    unmount();

    expect(mockLeave).toHaveBeenCalledWith('User.user-123');
  });

  /** T009: fallback to first 8 chars of hash_string when name is null */
  it('uses first 8 chars of hash_string when name is null', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useTorrentNotifications(), { wrapper });

    const eventHandler = mockListen.mock.calls[0][1];
    eventHandler({
      torrent_id: 'torrent-2',
      name: null,
      hash_string: 'deadbeef12345678',
      completed_at: '2026-04-04 12:00:00',
    });

    const actions = store.getState().toast.toasts;
    expect(actions).toHaveLength(1);
    expect(actions[0].message).toContain('deadbeef');
    // Should only use first 8 chars
    expect(actions[0].message).not.toContain('deadbeef12345678');
  });

  /** T009: fallback to "Download complete" when both name and hash_string are null */
  it('uses generic message when both name and hash_string are null', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useTorrentNotifications(), { wrapper });

    const eventHandler = mockListen.mock.calls[0][1];
    eventHandler({
      torrent_id: 'torrent-3',
      name: null,
      hash_string: null,
      completed_at: '2026-04-04 12:00:00',
    });

    const actions = store.getState().toast.toasts;
    expect(actions).toHaveLength(1);
    expect(actions[0].message).toContain('Download complete');
  });

  /** T009: fallback when name is empty string */
  it('uses hash_string fallback when name is empty string', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useTorrentNotifications(), { wrapper });

    const eventHandler = mockListen.mock.calls[0][1];
    eventHandler({
      torrent_id: 'torrent-4',
      name: '',
      hash_string: 'abcdef1234567890',
      completed_at: '2026-04-04 12:00:00',
    });

    const actions = store.getState().toast.toasts;
    expect(actions).toHaveLength(1);
    expect(actions[0].message).toContain('abcdef12');
  });

  /** T013: creates browser Notification when document.hidden is true and permission granted */
  it('creates browser Notification when tab is hidden and permission granted', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    // Mock document.hidden = true
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });

    // Mock Notification API
    const MockNotification = vi.fn();
    (MockNotification as any).permission = 'granted';
    vi.stubGlobal('Notification', MockNotification);

    renderHook(() => useTorrentNotifications(), { wrapper });

    const eventHandler = mockListen.mock.calls[0][1];
    eventHandler({
      torrent_id: 'torrent-5',
      name: 'Movie.mkv',
      hash_string: 'abc12345',
      completed_at: '2026-04-04 12:00:00',
    });

    expect(MockNotification).toHaveBeenCalledWith('Download Complete', {
      body: 'Movie.mkv',
    });

    // Cleanup
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    vi.unstubAllGlobals();
  });

  /** T014: does NOT create browser Notification when document.hidden is false */
  it('does not create browser Notification when tab is visible', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });

    const MockNotification = vi.fn();
    (MockNotification as any).permission = 'granted';
    vi.stubGlobal('Notification', MockNotification);

    renderHook(() => useTorrentNotifications(), { wrapper });

    const eventHandler = mockListen.mock.calls[0][1];
    eventHandler({
      torrent_id: 'torrent-6',
      name: 'Visible.mkv',
      hash_string: 'abc12345',
      completed_at: '2026-04-04 12:00:00',
    });

    expect(MockNotification).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  /** T014: does NOT create browser Notification when permission is not granted */
  it('does not create browser Notification when permission is denied', () => {
    const store = createTestStore('user-123');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });

    const MockNotification = vi.fn();
    (MockNotification as any).permission = 'denied';
    vi.stubGlobal('Notification', MockNotification);

    renderHook(() => useTorrentNotifications(), { wrapper });

    const eventHandler = mockListen.mock.calls[0][1];
    eventHandler({
      torrent_id: 'torrent-7',
      name: 'Denied.mkv',
      hash_string: 'abc12345',
      completed_at: '2026-04-04 12:00:00',
    });

    expect(MockNotification).not.toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    vi.unstubAllGlobals();
  });
});
