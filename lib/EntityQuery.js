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
var TsMonad = __importStar(require("tsmonad"));
var underscore_1 = __importDefault(require("underscore"));
var Utils_1 = require("./Utils");
var EntityQuery = /** @class */ (function () {
    function EntityQuery() {
    }
    EntityQuery.equals = function (a, b) {
        return a.id == b.id;
    };
    EntityQuery.getBy = function (entities, entity) {
        return underscore_1.default.first(entities.filter(function (e) { return EntityQuery.equals(e, entity); }));
    };
    EntityQuery.tryGetById = function (entities, id) {
        if (Utils_1.StringUtils.isNullOrEmpty(id))
            return TsMonad.Maybe.nothing();
        return Utils_1.MonadUtils.CreateMaybeFromNullable(id).caseOf({
            just: function (t) { return TsMonad.maybe(EntityQuery.getById(entities, id)); },
            nothing: function () { return TsMonad.Maybe.nothing(); }
        });
    };
    EntityQuery.getById = function (entities, id) {
        return underscore_1.default.first(entities.filter(function (e) { return e.id === id; }));
    };
    EntityQuery.exists = function (entities, e) {
        return underscore_1.default(entities).any(function (et) { return EntityQuery.equals(et, e); });
    };
    EntityQuery.existsById = function (entities, id) {
        return underscore_1.default(entities).any(function (et) { return et.id == id; });
    };
    EntityQuery.update = function (entities, entity) {
        return entities.map(function (e) { return EntityQuery.equals(e, entity) ? entity : e; });
    };
    EntityQuery.delete = function (entities, entity) {
        return entities.filter(function (e) { return !EntityQuery.equals(e, entity); });
    };
    EntityQuery.getDifference = function (entities, entitiesToRemove) {
        var _this = this;
        return entities.filter(function (x) { return !underscore_1.default.any(entitiesToRemove, function (y) { return _this.equals(x, y); }); });
    };
    ///returns all the elements in both collection without repetetion. Preserves the values of the first list.
    EntityQuery.union = function (E1, E2, areEqual) {
        return E1.concat(E2.filter(function (e1) { return E1.filter(function (e2) { return areEqual(e1, e2); }).length === 0; }));
    };
    return EntityQuery;
}());
exports.EntityQuery = EntityQuery;
//# sourceMappingURL=EntityQuery.js.map