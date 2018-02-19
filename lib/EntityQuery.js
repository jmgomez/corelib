Object.defineProperty(exports, "__esModule", { value: true });
const TsMonad = require("tsmonad");
const _ = require("underscore");
const Utils_1 = require("./Utils");
class EntityQuery {
    static equals(a, b) {
        return a.id == b.id;
    }
    static getBy(entities, entity) {
        return _.first(entities.filter(e => EntityQuery.equals(e, entity)));
    }
    static tryGetById(entities, id) {
        if (Utils_1.StringUtils.isNullOrEmpty(id))
            return TsMonad.Maybe.nothing();
        return Utils_1.MonadUtils.CreateMaybeFromNullable(id).caseOf({
            just: t => TsMonad.maybe(EntityQuery.getById(entities, id)),
            nothing: () => TsMonad.Maybe.nothing()
        });
    }
    static getById(entities, id) {
        return _.first(entities.filter(e => e.id === id));
    }
    static exists(entities, e) {
        return _(entities).any(et => EntityQuery.equals(et, e));
    }
    static existsById(entities, id) {
        return _(entities).any(et => et.id == id);
    }
    static update(entities, entity) {
        return entities.map(e => EntityQuery.equals(e, entity) ? entity : e);
    }
    static delete(entities, entity) {
        return entities.filter(e => !EntityQuery.equals(e, entity));
    }
    static getDifference(entities, entitiesToRemove) {
        return entities.filter(x => !_.any(entitiesToRemove, y => this.equals(x, y)));
    }
    ///returns all the elements in both collection without repetetion. Preserves the values of the first list.
    static union(E1, E2, areEqual) {
        return E1.concat(E2.filter(e1 => E1.filter(e2 => areEqual(e1, e2)).length === 0));
    }
}
exports.EntityQuery = EntityQuery;
//# sourceMappingURL=EntityQuery.js.map