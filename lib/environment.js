var util = require("util");

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var yaml = require("js-yaml");

/**
   Load an environment from YAML on the fs.
*/
function Environment(context, path, env_yaml) {
    // not using safeload; project files are assumed to be trusted (it
    // wouldn't make much sense otherwise).
    this.context = context;
    this.yaml = yaml.load(env_yaml);
}

Environment.new = function(context, path) {
    return fs.readFileAsync(path, {encoding: "utf-8"}).then(function(environment_yaml_contents) {
        logger.debug("Loading environment from:", path);
        return new Environment(context, path, environment_yaml_contents);
    }).catch(function(e) {
        if(e.cause !== undefined && e.cause.code === "ENOENT") {
            logger.error("You need to define an environment config for your current environment (or change DIA_ENV):", path);
        } else {
            throw e;
        }
    });
};

Environment.prototype.getApiserver = function() {
    return this.yaml.kubernetes.apiserver;
}

module.exports = Environment;
