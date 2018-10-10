"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = __importStar(require("rxjs"));
var node_fetch_1 = __importStar(require("node-fetch"));
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