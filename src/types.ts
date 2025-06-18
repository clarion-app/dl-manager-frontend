import { LaravelModelType } from "@clarion-app/types";

export interface TorrentServer extends LaravelModelType {
    local_node: string;
    address: string;
    type: string;
}

export interface Torrent extends LaravelModelType {
    local_node: string;
    server_id: string;
    user_id?: string;
    magnetURI: string;
    hash_string?: string;
    completed_at?: string;
    name?: string;
}