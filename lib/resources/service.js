var util = require("util");
var Resource = require("../resource");

// Kubernetes Service definition.
function Service(project, type, filename, contents) {
    Resource.call(this, project, type, filename, contents);
}
util.inherits(Service, Resource);

Service.prototype.__resource_name = "Servce";

Resource.loadValidator.call(Service, "service");

module.exports = Service;
