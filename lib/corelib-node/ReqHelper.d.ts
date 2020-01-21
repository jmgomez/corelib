import * as Rx from "rxjs";
import { Request, Response } from "node-fetch";
export declare class RequestHelperNodeImpl {
    static prepareRequest(url: string, method: string, data?: any, headers?: any): Request;
    static makeGetDigestRequest(username: string, password: string, url: string): Rx.Observable<any>;
    static makeRequest(url: string, method?: string, data?: any, onError?: (r: Response) => void): Rx.Observable<any>;
    static headers(): {
        'Accept': string;
        'Content-Type': string;
    };
}
//# sourceMappingURL=ReqHelper.d.ts.map