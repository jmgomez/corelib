"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bacon = require("baconjs");
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
        promise.catch(function (e) {
            var r = new node_fetch_1.Response();
            console.error(e);
            onError(r);
        });
        promise.then(function (r) {
            if (!r.ok && onError)
                onError(r);
        });
        return Bacon.fromPromise(promise)
            .flatMap(function (res) { return Bacon.fromPromise(res.json()); });
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