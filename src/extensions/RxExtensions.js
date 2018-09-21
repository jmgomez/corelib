Object.defineProperty(exports, "__esModule", { value: true });
const Rx = require("rxjs");
function measureStream(label, repoCaller) {
    // let stream: PromiseObservable<T> = this as any;
    console.time(label);
    return this.map(result => {
        console.timeEnd(label);
        if (repoCaller) {
            let r = repoCaller;
            if (r.db != undefined) {
                Rx.Observable.fromPromise(r.db.command({ getLastRequestStatistics: 1 })).subscribe(console.log, e => console.log("this is mongo"));
            }
        }
        return result;
    });
}
exports.measureStream = measureStream;
function initExtensions() {
    console.log("ehhhhh")
    Rx.Observable.prototype.measure = measureStream;
}
exports.initExtensions = initExtensions;
initExtensions();
//# sourceMappingURL=RxExtensions.js.map