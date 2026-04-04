import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { WindowWS } from '@clarion-app/types';

interface TorrentCompletedPayload {
  torrent_id: string;
  name: string | null;
  hash_string: string | null;
  completed_at: string;
}

export function useTorrentNotifications(): void {
  const userId = useSelector((state: any) => state.loggedInUser?.value?.id);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const win = window as unknown as WindowWS;
    const channel = win.Echo.private('User.' + userId);

    channel.listen(
      '.ClarionApp\\DownloadManagerBackend\\Events\\TorrentCompletedEvent',
      (event: TorrentCompletedPayload) => {
        const displayName = event.name || event.hash_string?.substring(0, 8) || 'Download complete';

        dispatch({
          type: 'toast/addToast',
          payload: {
            message: `${displayName} has finished downloading`,
            type: 'success' as const,
            dismissible: true,
          },
        });

        // Browser notification when tab is not focused and permission is granted
        if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Download Complete', { body: displayName });
        }
      },
    );

    return () => {
      win.Echo.leave('User.' + userId);
    };
  }, [userId, dispatch]);
}
