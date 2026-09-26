import { CodeContext } from '../context/ContextProvider';

export type LumoRole =
    | 'system'
    | 'user'
    | 'assistant';

export interface LumoMessage {
    role: LumoRole;
    content: string;
}

export interface LumoRequest {
    message: string;
    context: CodeContext;
    messages?: LumoMessage[];
}

export interface LumoResponse {
    content: string;
}