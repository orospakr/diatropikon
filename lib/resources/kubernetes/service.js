var util = require("util");
var Kubernetes = require("../kubernetes");

// Kubernetes Service definition.
function Service(project, type, filename, contents) {
    Kubernetes.call(this, project, type, filename, contents);
}
util.inherits(Service, Kubernetes);

Service.prototype.__resource_name = "Servce";

Kubernetes.loadValidator.call(Service, "service");

module.exports = Service;
