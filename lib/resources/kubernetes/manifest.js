var util = require("util");
var Resource = require("../../resource");

// Kubernetes Manifest definition.
function Manifest(type, filename, contents) {
    Resource.call(this, type, filename, contents);
}
util.inherits(Manifest, Resource);

Manifest.prototype.__resource_name = "Manifest";
Resource.loadValidator.call(Manifest, "manifest");

module.exports = Manifest;
