import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the handler registered via registerUserChannelHandler
let capturedHandler: { event: string; handler: (event: any, dispatch: any) => void } | null = null;

vi.mock('@clarion-app/frontend-base', () => ({
  registerUserChannelHandler: (h: any) => {
    capturedHandler = h;
  },
}));

// Import triggers the side-effect registration
await import('../useTorrentNotifications');

describe('useTorrentNotifications registration', () => {
  let mockDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = vi.fn();
  });

  it('registers a handler for TorrentCompletedEvent', () => {
    expect(capturedHandler).not.toBeNull();
    expect(capturedHandler!.event).toBe(
      '.ClarionApp\\DownloadManagerBackend\\Events\\TorrentCompletedEvent',
    );
  });

  it('dispatches addToast with torrent name on event', () => {
    capturedHandler!.handler(
      {
        torrent_id: 'torrent-1',
        name: 'Movie.mkv',
        hash_string: 'abc12345',
        completed_at: '2026-04-04 12:00:00',
      },
      mockDispatch,
    );

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'toast/addToast',
        payload: expect.objectContaining({
          message: expect.stringContaining('Movie.mkv'),
          type: 'success',
          dismissible: true,
        }),
      }),
    );
  });

  it('uses first 8 chars of hash_string when name is null', () => {
    capturedHandler!.handler(
      {
        torrent_id: 'torrent-2',
        name: null,
        hash_string: 'deadbeef12345678',
        completed_at: '2026-04-04 12:00:00',
      },
      mockDispatch,
    );

    const msg = mockDispatch.mock.calls[0][0].payload.message;
    expect(msg).toContain('deadbeef');
    expect(msg).not.toContain('deadbeef12345678');
  });

  it('uses generic message when both name and hash_string are null', () => {
    capturedHandler!.handler(
      {
        torrent_id: 'torrent-3',
        name: null,
        hash_string: null,
        completed_at: '2026-04-04 12:00:00',
      },
      mockDispatch,
    );

    const msg = mockDispatch.mock.calls[0][0].payload.message;
    expect(msg).toContain('Download complete');
  });

  it('uses hash_string fallback when name is empty string', () => {
    capturedHandler!.handler(
      {
        torrent_id: 'torrent-4',
        name: '',
        hash_string: 'abcdef1234567890',
        completed_at: '2026-04-04 12:00:00',
      },
      mockDispatch,
    );

    const msg = mockDispatch.mock.calls[0][0].payload.message;
    expect(msg).toContain('abcdef12');
  });

  it('creates browser Notification when tab is hidden and permission granted', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    const MockNotification = vi.fn();
    (MockNotification as any).permission = 'granted';
    vi.stubGlobal('Notification', MockNotification);

    capturedHandler!.handler(
      {
        torrent_id: 'torrent-5',
        name: 'Movie.mkv',
        hash_string: 'abc12345',
        completed_at: '2026-04-04 12:00:00',
      },
      mockDispatch,
    );

    expect(MockNotification).toHaveBeenCalledWith('Download Complete', {
      body: 'Movie.mkv',
    });

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    vi.unstubAllGlobals();
  });

  it('does not create browser Notification when tab is visible', () => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    const MockNotification = vi.fn();
    (MockNotification as any).permission = 'granted';
    vi.stubGlobal('Notification', MockNotification);

    capturedHandler!.handler(
      {
        torrent_id: 'torrent-6',
        name: 'Visible.mkv',
        hash_string: 'abc12345',
        completed_at: '2026-04-04 12:00:00',
      },
      mockDispatch,
    );

    expect(MockNotification).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('does not create browser Notification when permission is denied', () => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    const MockNotification = vi.fn();
    (MockNotification as any).permission = 'denied';
    vi.stubGlobal('Notification', MockNotification);

    capturedHandler!.handler(
      {
        torrent_id: 'torrent-7',
        name: 'Denied.mkv',
        hash_string: 'abc12345',
        completed_at: '2026-04-04 12:00:00',
      },
      mockDispatch,
    );

    expect(MockNotification).not.toHaveBeenCalled();
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    vi.unstubAllGlobals();
  });
});
