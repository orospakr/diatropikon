var util = require("util");

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var yaml = require("js-yaml");

var Resource = require("../resource");

/**
   Load an environment from YAML on the fs.
*/
function Environment(type, path, contents) {
    // not using safeload; project files are assumed to be trusted (it
    // wouldn't make much sense otherwise).

    Resource.call(this, type, path, contents);
}
util.inherits(Environment, Resource);
Environment.prototype.__resource_name = "Environment";

module.exports = Environment;

// TODO: validate sanity of values.  in particular, watch for trailing
// slash on apiserver

// TODO: defaults


Environment.prototype.getApiserver = function() {
    return this.apiserver;
}

// Environment.prototype.getBuilderDockerHost = function() {
//     return this.yaml.kubernetes.builder_docker_host || "localhost";
// }

// Environment.prototype.getBuilderDockerPort = function() {
//     return this.yaml.kubernetes.builder_docker_port || 2375;
// }

module.exports = Environment;
