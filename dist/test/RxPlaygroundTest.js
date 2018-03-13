"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Rx = require("rxjs");
var Bacon = require("baconjs");
var chai_1 = require("chai");
var Bus = Bacon.Bus;
var Utils_1 = require("../lib/Utils");
it("rx playgroung ", function (done) {
    //Converting to observables
    // From one or multiple values
    // Rx.Observable.of('foo', 'bar').do();
    var bus = new Bus();
    var observable = Utils_1.RXUtils.fromStream(bus);
    var baconStream = Utils_1.RXUtils.toStream(observable);
    baconStream.onValue(function (value) {
        console.log("BACON: ", value);
    });
    baconStream.onError(function (e) { return console.log("BACON", e); });
    baconStream.onEnd(function () { return console.log("BACON END"); });
    observable.subscribe(function (value) {
        return console.log("RX", value);
    }, function (e) {
        console.log("ERROR  RX", e),
            function () { return console.log("END RX"); };
    });
    bus.push("WHATEVER FROM BACON");
    bus.error("ERROR DSDE BACON");
    bus.push("ANOTHER VALUE");
    bus.end();
    bus.push("ANOTHER VALUE 2");
    // From array of values
    // Rx.Observable.from([1,2,3]).filter(n=> n%2 == 1).subscribe(n=>console.log("IMPAR ", n ));
    // From an event
    // From a Promise
    // Rx.Observable.fromPromise(fetch('/users'));
    // From a callback (last argument is a callback)
    // fs.exists = (path, cb(exists))
    // var exists = Rx.Observable.bindCallback(fs.exists);
    // exists('file.txt').subscribe(exists => console.log('Does file exist?', exists));
    Rx.Observable.timer(300).subscribe(function () {
        console.log("FINISH");
        chai_1.expect(true).eq(true);
        done();
    });
});
//# sourceMappingURL=RxPlaygroundTest.js.map