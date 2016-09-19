var toJSON = require('./lib/toJSON');
var fromJSON = require('./lib/fromJSON');

module.exports.fileToJSON = toJSON.csvFileToJson;
module.exports.toJSON = toJSON.csvToJson;
module.exports.fromJSON = fromJSON;
