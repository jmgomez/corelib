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
function measureStream(label, repoCaller) {
    // let stream: PromiseObservable<T> = this as any;
    console.time(label);
    return this.map(function (result) {
        console.timeEnd(label);
        if (repoCaller) {
            var r = repoCaller;
            if (r.db != undefined) {
                Rx.Observable.fromPromise(r.db.command({ getLastRequestStatistics: 1 })).subscribe(console.log, function (e) { return console.log("this is mongo"); });
            }
        }
        return result;
    });
}
exports.measureStream = measureStream;
function initExtensions() {
    Rx.Observable.prototype.measure = measureStream;
    if (!Rx.Observable.prototype.notify)
        Rx.Observable.prototype.notify = function (body, error) {
            var stream = this;
            return stream;
        };
    Rx.Observable.prototype.notifyWarning = function (body, error) { return Rx.Observable.of({}); };
}
exports.initExtensions = initExtensions;
initExtensions();
//# sourceMappingURL=RxExtensions.js.map