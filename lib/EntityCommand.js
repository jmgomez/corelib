"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntityCommand = /** @class */ (function () {
    function EntityCommand() {
    }
    EntityCommand.updateField = function (e, key, value) {
        e[key] = value;
        return e;
    };
    return EntityCommand;
}());
exports.EntityCommand = EntityCommand;
//# sourceMappingURL=EntityCommand.js.map