"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = require("rxjs");
var node_fetch_1 = require("node-fetch");
var RequestHelperNodeImpl = /** @class */ (function () {
    function RequestHelperNodeImpl() {
    }
    RequestHelperNodeImpl.prepareRequest = function (url, method, data) {
        if (method === "get")
            return new node_fetch_1.Request(url, { method: method, headers: this.headers() });
        return new node_fetch_1.Request(url, { method: method, body: JSON.stringify(data), headers: this.headers() });
    };
    RequestHelperNodeImpl.makeRequest = function (url, method, data, onError) {
        method = method ? method : "POST";
        var promise = node_fetch_1.default(this.prepareRequest(url, method, data));
        return Rx.Observable.fromPromise(promise.then(function (res) { return res.json(); }).catch(function (e) { return onError(e); }));
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