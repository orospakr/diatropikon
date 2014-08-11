var util = require("util");
var Kubernetes = require("../kubernetes");

// Kubernetes Pod definition.
function Pod(project, type, filename, contents) {
    Kubernetes.call(this, project, type, filename, contents);
}
util.inherits(Pod, Kubernetes);

Pod.prototype.__resource_name = "Pod";

Kubernetes.loadValidator.call(Pod, "pod");

// DSL methods:

//Pod.prototype.

module.exports = Pod;

// TODO: manifests are validated separately.
