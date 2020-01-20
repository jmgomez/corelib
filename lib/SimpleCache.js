"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
var Rx = __importStar(require("rxjs"));
var SimpleCache = /** @class */ (function () {
    function SimpleCache() {
    }
    SimpleCache.timePolicyFromRx = function (delay) {
        return function () { return Rx.Observable.timer(0, delay); };
    };
    SimpleCache.create = function (getValue, invalidateCachePolicy) {
        var simpleCache = new SimpleCache();
        simpleCache.getValue = getValue;
        simpleCache.invalidateCachePolicy = invalidateCachePolicy;
        simpleCache.invalidateCachePolicy()
            .subscribe(function (d) {
            simpleCache.cleanCache();
        });
        return simpleCache;
    };
    SimpleCache.prototype.cleanCache = function () {
        this.data = null;
    };
    SimpleCache.prototype.tryGet = function () {
        return Utils_1.MonadUtils.CreateMaybeFromNullable(this.data);
    };
    SimpleCache.prototype.get = function () {
        var _this = this;
        return Utils_1.MonadUtils.mapToRxFallback(this.tryGet(), function () { return _this.getValue()
            .do(function (dataToCache) { _this.data = dataToCache; })
            .map(Utils_1.MonadUtils.CreateMaybeFromNullable); });
    };
    SimpleCache.prototype.set = function (value) {
        this.data = value;
    };
    SimpleCache.prototype.del = function () {
        this.data = null;
    };
    return SimpleCache;
}());
exports.SimpleCache = SimpleCache;
//# sourceMappingURL=SimpleCache.js.map