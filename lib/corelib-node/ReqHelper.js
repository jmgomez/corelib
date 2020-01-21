"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = __importStar(require("rxjs"));
var node_fetch_1 = __importStar(require("node-fetch"));
var digest_fetch_1 = __importDefault(require("digest-fetch"));
var RequestHelperNodeImpl = /** @class */ (function () {
    function RequestHelperNodeImpl() {
    }
    RequestHelperNodeImpl.prepareRequest = function (url, method, data, headers) {
        headers = headers || this.headers();
        if (method === "get")
            return new node_fetch_1.Request(url, { method: method, headers: this.headers() });
        return new node_fetch_1.Request(url, { method: method, body: JSON.stringify(data), headers: this.headers() });
    };
    //This was added to being able to make digest to atlas
    RequestHelperNodeImpl.makeGetDigestRequest = function (username, password, url) {
        var client = new digest_fetch_1.default(username, password);
        return Rx.Observable.fromPromise(client.fetch(url)).flatMap(function (res) {
            if (res.ok)
                return new Rx.Observable(function (observer) {
                    try {
                        res.json().then(function (json) {
                            observer.next(json);
                            observer.complete();
                        });
                    }
                    catch (e) {
                        observer.error(e);
                    }
                });
            return Rx.Observable.throw(new Error("Server Response " + res.status + " " + res.statusText + " URL " + url + " Method: GET"));
        }).share();
    };
    RequestHelperNodeImpl.makeRequest = function (url, method, data, onError) {
        method = method ? method : "POST";
        return Rx.Observable.fromPromise(node_fetch_1.default(this.prepareRequest(url, method, data))).flatMap(function (res) {
            if (res.ok)
                return new Rx.Observable(function (observer) {
                    try {
                        res.json().then(function (json) {
                            observer.next(json);
                            observer.complete();
                        });
                    }
                    catch (e) {
                        observer.error(e);
                    }
                });
            if (onError)
                onError(res);
            return Rx.Observable.throw(new Error("Server Response " + res.status + " " + res.statusText + " URL " + url + " Method: " + method));
        }).share();
        //AT some point fix this
        // let promise = fetch(this.prepareRequest(url, method, data));
        // return Rx.Observable.fromPromise(promise.then(res=>res.json()).catch(e=> {  
        //     onError(e); 
        // }))
    };
    RequestHelperNodeImpl.headers = function () {
        return {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
        };
    };
    return RequestHelperNodeImpl;
}());
exports.RequestHelperNodeImpl = RequestHelperNodeImpl;
//# sourceMappingURL=ReqHelper.js.map