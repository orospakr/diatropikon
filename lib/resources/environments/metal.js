var util = require("util");
var Environment = require("../environment");

function Metal(type, filename, contents) {
    Environment.call(this, type, filename);
}
util.inherits(Metal, Environment);

Metal.prototype.__resource_name = "Metal";

module.exports = Metal;

