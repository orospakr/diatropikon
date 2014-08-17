var util = require("util");

var Kubernetes = require("../kubernetes");

// Kubernetes Service definition.
function Service(type, filename, contents) {
    Service.super_.apply(this, arguments);
}
Kubernetes.registerSubtype(Service, "Service");

Kubernetes.loadValidator.call(Service, "service");

module.exports = Service;
