var util = require("util");
var Resource = require("../../resource");

// Kubernetes Manifest definition.
function Manifest(project, type, filename, contents) {
    Resource.call(this, project, type, filename, contents);
}
util.inherits(Manifest, Resource);

Manifest.prototype.__resource_name = "Manifest";
Resource.loadValidator.call(Manifest, "manifest");

module.exports = Manifest;
