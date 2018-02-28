import * as Bacon from "baconjs";
import { Request, Response } from "node-fetch";
export declare class RequestHelperNodeImpl {
    static prepareRequest(url: string, method: string, data?: any): Request;
    static makeRequest(url: string, method?: string, data?: any, onError?: (r: Response) => void): Bacon.EventStream<{}, any>;
    static headers(): {
        'Accept': string;
        'Content-Type': string;
    };
}
