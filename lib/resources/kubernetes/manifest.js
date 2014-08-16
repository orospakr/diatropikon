var util = require("util");
var Kubernetes = require("../kubernetes");

// Kubernetes Manifest definition.
function Manifest(type, filename, contents) {
    Kubernetes.call(this, type, filename, contents);
}
Kubernetes.registerSubtype(Manifest, "Manifest");
Kubernetes.loadValidator.call(Manifest, "manifest");

module.exports = Manifest;
