var util = require("util");
var Resource = require("../resource");

// Kubernetes Container defintion (not be confused with a Docker
// container image definition, see image.js).
function Container(project, type, filename, contents) {
    Resource.call(this, project, type, filename, contents);
}
util.inherits(Container, Resource);

Container.gather = function(project) {
    var resource_name = "container";
}

module.exports = Container;
