import { downloadManagerApi } from "./downloadManagerApi";
import { TorrentServer } from "./TorrentServer";
import { TorrentServers } from "./TorrentServers";
import { Torrent } from "./Torrent";
import { Torrents } from "./Torrents";
import './useTorrentNotifications'; // side-effect: registers event handler

export { backend, updateFrontend } from './config';

export {
    downloadManagerApi,
    TorrentServer,
    TorrentServers,
    Torrent,
    Torrents,
};
