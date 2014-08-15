var util = require("util");
var inherits = require("../../inherits");
var Kubernetes = require("../kubernetes");

// Kubernetes Service definition.
function Service(type, filename, contents) {
    Kubernetes.call(this, type, filename, contents);
}
Kubernetes.registerSubtype(Service, "Service");

Kubernetes.loadValidator.call(Service, "service");

module.exports = Service;
