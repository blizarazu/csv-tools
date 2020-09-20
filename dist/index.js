"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromJSON = exports.toJSON = void 0;
var toJSON_1 = require("./toJSON");
Object.defineProperty(exports, "toJSON", { enumerable: true, get: function () { return toJSON_1.csvToJson; } });
var fromJSON_1 = require("./fromJSON");
Object.defineProperty(exports, "fromJSON", { enumerable: true, get: function () { return fromJSON_1.jsonArrayToCsv; } });
