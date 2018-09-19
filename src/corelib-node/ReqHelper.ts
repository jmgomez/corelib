
import * as Rx from "rxjs";
import fetch, {Request, Response} from "node-fetch";

export class RequestHelperNodeImpl {

    static prepareRequest(url:string, method:string, data?:any) {
        if (method === "get")
            return new Request(url, {method: method, headers: this.headers()});
        return new Request(url, {method: method, body: JSON.stringify(data), headers: this.headers()});
    }

    static makeRequest(url: string, method?: string, data?: any, onError?:(r:Response)=>void) {
        method = method ? method : "POST";

        let promise = fetch(this.prepareRequest(url, method, data));
        return Rx.Observable.fromPromise(promise.then(res=>res.json()).catch(e=> onError(e)))

    }

    static headers() {
        return {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
        };
    }
}