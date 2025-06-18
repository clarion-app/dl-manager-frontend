import { BackendType } from "@clarion-app/types";
import { downloadManagerApi } from "./downloadManagerApi";
import { TorrentServer } from "./TorrentServer";
import { TorrentServers } from "./TorrentServers";
import { Torrent } from "./Torrent";
import { Torrents } from "./Torrents";

export const backend: BackendType = { url: "http://localhost:8000", token: "", user: { id: "", name: "", email: ""} };

export const updateFrontend = (config: BackendType) => {
    backend.url = config.url;
    backend.token = config.token;
    backend.user = config.user;
};

export {
    downloadManagerApi,
    TorrentServer,
    TorrentServers,
    Torrent,
    Torrents,
};
