var util = require("util");
var Kubernetes = require("../kubernetes");

// Kubernetes Manifest definition.
function Manifest(type, filename, contents) {
    Manifest.super_.apply(this, arguments);
}
Kubernetes.registerSubtype(Manifest, "Manifest");
Kubernetes.loadValidator.call(Manifest, "manifest");

module.exports = Manifest;
