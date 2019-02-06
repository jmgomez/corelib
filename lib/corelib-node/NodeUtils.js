"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NodeUtils = /** @class */ (function () {
    function NodeUtils() {
    }
    NodeUtils.okOptions = function (req, res) {
        res.sendStatus(200);
    };
    NodeUtils.writeResponse = function (res, code) { return function (val) { res.status(code ? code : 200).json(val); }; };
    NodeUtils.writeError = function (res) { return NodeUtils.writeResponse(res, 500); };
    NodeUtils.writeForbidden = function (res) { return NodeUtils.writeResponse(res, 403); };
    return NodeUtils;
}());
exports.NodeUtils = NodeUtils;
//# sourceMappingURL=NodeUtils.js.map