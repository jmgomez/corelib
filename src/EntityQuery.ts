import * as TsMonad from 'tsmonad';
import _ from 'underscore';
import {MonadUtils, StringUtils} from "./Utils";
import {Entity} from "./Entity";

export class EntityQuery {
    static equals<T extends Entity>(a:T, b:T){
        return a.id == b.id;
    }
    static getBy<T extends Entity>(entities:T[], entity:T){
        return _.first(entities.filter(e=> EntityQuery.equals(e, entity)));
    }
    static tryGetById<T extends Entity>(entities:T[], id:string){
        if(StringUtils.isNullOrEmpty(id)) return TsMonad.Maybe.nothing<T>();
        return MonadUtils.CreateMaybeFromNullable(id).caseOf({
            just: t => TsMonad.maybe(EntityQuery.getById(entities, id)),
            nothing: () => TsMonad.Maybe.nothing<T>()
        });
    }
    static getById<T extends Entity>(entities:T[], id:string) : T{
        return _.first(entities.filter(e=>e.id === id));
    }
    static exists<T extends Entity>(entities:T[], e:T){
        return _(entities).any(et=>EntityQuery.equals(et, e));
    }
    static existsById<T extends Entity>(entities:T[], id:string){
        return _(entities).any(et=> et.id == id);
    }

    static add<T extends Entity>(entities:T[], entity:T){
        return entities.concat(entity)
    }

    static update<T extends Entity>(entities:T[], entity:T){
        return entities.map(e=>EntityQuery.equals(e, entity)? entity : e);
    }

    static delete<T extends Entity>(entities:T[], entity:T){
        return entities.filter(e=>!EntityQuery.equals(e, entity));
    }
    static getDifference<T extends Entity>(entities:T[], entitiesToRemove:T[]){
        return entities.filter(x=> !_.any(entitiesToRemove, y=>this.equals(x, y)))
    }

    ///returns all the elements in both collection without repetetion. Preserves the values of the first list.
    static union<T extends Entity>(E1:T[], E2:T[], areEqual : (entity1:T, entity2:T)=>boolean) {
        return E1.concat( E2.filter(e1=> E1.filter(e2=> areEqual(e1, e2)).length === 0))
    }
}

