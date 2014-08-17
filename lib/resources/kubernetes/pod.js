var util = require("util");
var Kubernetes = require("../kubernetes");

// Kubernetes Pod definition.
function Pod(type, filename, contents) {
    Pod.super_.apply(this, arguments);
}
Kubernetes.registerSubtype(Pod, "Pod");

Kubernetes.loadValidator.call(Pod, "pod");

// DSL methods:

//Pod.prototype.

module.exports = Pod;

// TODO: manifests are validated separately.
