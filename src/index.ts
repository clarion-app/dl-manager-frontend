import { BackendType } from "@clarion-app/types";
import { downloadsApi } from "./downloadManagerApi";
import { Message } from "./Message";
import { Messages } from "./Messages";

export const backend: BackendType = { url: "http://localhost:8000", token: "", user: { id: "", name: "", email: ""} };

export const updateFrontend = (config: BackendType) => {
    backend.url = config.url;
    backend.token = config.token;
    backend.user = config.user;
};

export {
    downloadsApi,
    Message,
    Messages,
};
