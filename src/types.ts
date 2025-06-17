import { LaravelModelType } from "@clarion-app/types";

export interface TorrentServer extends LaravelModelType {
    local_node: string;
    address: string;
    type: string;
}