var util = require("util");
var Environment = require("../environment");

/**
   A simple environment, consisting of a list of manually (that is,
   outside the scope of Diatropikon) configured hosts.
 */
function Metal(type, filename, contents) {
    Metal.super_.apply(this, arguments);
}
Metal.Builder = function() {
    Metal.Builder.super_.apply(this, arguments);
};

Environment.registerSubtype(Metal, "Metal");

module.exports = Metal;
