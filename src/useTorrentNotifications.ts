import { registerUserChannelHandler } from '@clarion-app/frontend-base';

interface TorrentCompletedPayload {
  torrent_id: string;
  name: string | null;
  hash_string: string | null;
  completed_at: string;
}

registerUserChannelHandler({
  event: '.ClarionApp\\DownloadManagerBackend\\Events\\TorrentCompletedEvent',
  handler: (event: TorrentCompletedPayload, dispatch) => {
    const displayName = event.name || event.hash_string?.substring(0, 8) || 'Download complete';

    dispatch({
      type: 'toast/addToast',
      payload: {
        message: `${displayName} has finished downloading`,
        type: 'success' as const,
        dismissible: true,
      },
    });

    if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Download Complete', { body: displayName });
    }
  },
});
