
import * as Rx from "rxjs";
import fetch, {Request, Response} from "node-fetch";
import DigestFetch from 'digest-fetch';

export class RequestHelperNodeImpl {

    static prepareRequest(url:string, method:string, data?:any, headers?:any) {
        headers = headers || this.headers();
        if (method === "get")
            return new Request(url, {method: method, headers: this.headers()});
        return new Request(url, {method: method, body: JSON.stringify(data), headers: this.headers()});
    }

    
    //This was added to being able to make digest to atlas
    static makeGetDigestRequest(username:string, password:string, url: string) : Rx.Observable<any>{
        let client = new DigestFetch(username, password);        
        return Rx.Observable.fromPromise<Response>(client.fetch(url)).flatMap(res=>{
            if(res.ok) 
                return new Rx.Observable( observer =>{
                    try{
                        res.json().then( json =>{                                  
                            observer.next(json)
                            observer.complete();
                        })
                    
                    }catch(e){
                        observer.error(e)
                    } });          
            return Rx.Observable.throw(new Error(`Server Response ${ res.status } ${ res.statusText } URL ${url} Method: GET`))
        }).share();
    }

    static makeRequest(url: string, method?: string, data?: any, onError?:(r:Response)=>void) : Rx.Observable<any>{
        method = method ? method : "POST";
        return Rx.Observable.fromPromise(fetch(this.prepareRequest(url, method, data))).flatMap(res=>{
            if(res.ok) 
                return new Rx.Observable( observer =>{
                    try{
                        res.json().then( json =>{                                  
                            observer.next(json)
                            observer.complete();
                        })
                    
                    }catch(e){
                        observer.error(e)
                    } });
             if (onError)
                 onError(res);
            return Rx.Observable.throw(new Error(`Server Response ${ res.status } ${ res.statusText } URL ${url} Method: ${ method }`))
        }).share();
        //AT some point fix this
        // let promise = fetch(this.prepareRequest(url, method, data));
        // return Rx.Observable.fromPromise(promise.then(res=>res.json()).catch(e=> {  
        //     onError(e); 
        // }))

    }

    static headers() {
        return {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
        };
    }
}