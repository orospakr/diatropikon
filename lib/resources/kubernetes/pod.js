var util = require("util");
var Resource = require("../../resource");

// Kubernetes Pod definition.
function Pod(project, type, filename, contents) {
    Resource.call(this, project, type, filename, contents);
}
util.inherits(Pod, Resource);

Pod.prototype.__resource_name = "Pod";

Resource.loadValidator.call(Pod, "pod");

// DSL methods:

//Pod.prototype.

module.exports = Pod;

// TODO: manifests are validated separately.
