var util = require("util");
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var yaml = require("js-yaml");

var Resource = require("../resource");

/**
   Load an environment from YAML on the fs.
*/
function Environment(type, path, contents) {
    Environment.super_.apply(this, arguments);
}
Resource.registerSubtype(Environment, "Environment");

// TODO: validate sanity of values.  in particular, watch for trailing
// slash on apiserver

// TODO: defaults

Environment.prototype.getApiserver = function() {
    return this.apiserver;
}

// TODO: andrew start here, figure out WTF I was doing last with this.  I think I had a goal;
// these are getting replaced with something...

// Environment.prototype.getBuilderDockerHost = function() {
//     return this.yaml.kubernetes.builder_docker_host || "localhost";
// }

// Environment.prototype.getBuilderDockerPort = function() {
//     return this.yaml.kubernetes.builder_docker_port || 2375;
// }

module.exports = Environment;
