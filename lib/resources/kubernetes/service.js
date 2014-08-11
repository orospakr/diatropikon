var util = require("util");
var Kubernetes = require("../kubernetes");

// Kubernetes Service definition.
function Service(type, filename, contents) {
    Kubernetes.call(this, type, filename, contents);
}
util.inherits(Service, Kubernetes);

Service.prototype.__resource_name = "Servce";

Kubernetes.loadValidator.call(Service, "service");

module.exports = Service;
