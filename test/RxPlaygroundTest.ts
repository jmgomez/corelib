import * as Rx from 'rxjs';
import * as Bacon from 'baconjs';
import * as fs from "fs";
import {expect} from 'chai';
import EventStream = Bacon.EventStream;
import Bus = Bacon.Bus;
import {RXUtils} from "../lib/Utils";


it("rx playgroung ", (done)=>{
    //Converting to observables
    // From one or multiple values
    // Rx.Observable.of('foo', 'bar').do();
    let bus : Bus<any,string> = new Bus();


    let observable = RXUtils.fromStream<string>(bus);
    let baconStream = RXUtils.toStream(observable);

    baconStream.onValue(value=>{
        console.log("BACON: ", value)
    })

    baconStream.onError(e=> console.log("BACON", e));
    baconStream.onEnd(()=>console.log("BACON END"))


    observable.subscribe(
        value =>
            console.log("RX", value),
        e=>{
            console.log("ERROR  RX", e),
            ()=> console.log("END RX")


    });


    bus.push("WHATEVER FROM BACON")
    bus.error("ERROR DSDE BACON")
    bus.push("ANOTHER VALUE")
    bus.end();
    bus.push("ANOTHER VALUE 2")
    // From array of values
    // Rx.Observable.from([1,2,3]).filter(n=> n%2 == 1).subscribe(n=>console.log("IMPAR ", n ));

    // From an event

    // From a Promise
    // Rx.Observable.fromPromise(fetch('/users'));

    // From a callback (last argument is a callback)
    // fs.exists = (path, cb(exists))
    // var exists = Rx.Observable.bindCallback(fs.exists);
    // exists('file.txt').subscribe(exists => console.log('Does file exist?', exists));

     Rx.Observable.timer(300).subscribe(()=>{
        console.log("FINISH");
         expect(true).eq(true);
         done();

     });

});