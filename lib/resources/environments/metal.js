var util = require("util");
var Environment = require("../environment");

function Metal(type, filename, contents) {
    Environment.call(this, type, filename);
}
Environment.registerSubtype(Metal, "Metal");

module.exports = Metal;

