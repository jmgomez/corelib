import * as Rx from "rxjs";
import { Response } from "node-fetch";
export declare class RequestHelperNodeImpl {
    static prepareRequest(url: string, method: string, data?: any): any;
    static makeRequest(url: string, method?: string, data?: any, onError?: (r: Response) => void): Rx.Observable<{}>;
    static headers(): {
        'Accept': string;
        'Content-Type': string;
    };
}
//# sourceMappingURL=ReqHelper.d.ts.map