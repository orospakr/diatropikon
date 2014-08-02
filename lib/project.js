// Represents the user's project.

var util = require("util");
var path = require("path");
var Diafile = require("./diafile");
var Promise = require("bluebird");

var fs = Promise.promisifyAll(require("fs"));

var Pod = require("./resources/pod.js");
var Service = require("./resources/service.js");

var Environment = require("./environment");

var KubernetesClient = require("./kubernetes-rest");
var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;
var KubernetesError = Errors.KubernetesError;

var DIAFILE_NAME = "Diafile";

function Project(context, search_from) {
    this.context = context;
    // how do I handle my recursive-resolution feature? I think I
    // should maybe leave it out for now.
}

Project.new = function(context, search_from) {
    var self = new Project(context);

    var top = path.resolve(search_from);
    var diafile = undefined;
    
    while (diafile == undefined) {
        var potential = path.join(top, DIAFILE_NAME);
        if(fs.existsSync(potential)) {
            // found one!
            diafile = potential;
        } else {
            new_top = path.resolve(top, "..");
            if(top == new_top) {
                // unable to back up further, so break.
                break;
            }
            top = new_top;
        }
    }

    self.top_level = top;

    if(diafile == undefined) {
        throw new Error("Unable to find a Diafile!  Try specifying a path to your project with -d.");
    }

    return Diafile.new(self.context, diafile).then(function(diafile_processed) {
        // TODO: do a promise.all for all for all of the
        // resources. but, ideally ensure they're synchronously (that
        // is, in deterministic order) loaded.

        // load images
        // load containers

        // load pods
        // load replication controllers
        // load services

        return Promise.all([self.loadResources(Service, "services").then(function(services) {
            self.services = services;
        }), self.loadResources(Pod, "pods").then(function(pods) {
            self.pods = pods;
        })]);
        
    }).then(function() {
        // now, to load the current environment.

        var env_path = path.join(self.top_level, "environments", self.context.environmentName() + ".yaml");

        return Environment.new(self, env_path);
    }).then(function(env) {
        self.env = env;

        return self;
    });
};

// Returns a list of all the loaded resources for the given type.
Project.prototype.loadResources = function(resource_class, resource_name) {
    var self = this;

    var resources_path = path.join(this.top_level, resource_name);

    return fs.readdirAsync(resources_path).catch(function(err) {
        if(err.cause !== undefined && err.cause.code === "ENOENT") {
            logger.warn("No '" + resource_name + "' directory.");
            return [];
        } else {
            throw err;
        }
    }).then(function(resources_dir_contents) {
        return Promise.map(resources_dir_contents.filter(function(resource_path) {

            // filter out file extensions that aren't from our list
            // and hidden files
            var ext = path.extname(resource_path).toLowerCase();
            return resource_path[0] !== "." && [".coffee", ".litcoffee", ".json", ".yaml"].indexOf(ext) !== -1;
        }), function(resource_path) {
            logger.debug("Loading resource", resource_path);
            var ext = path.extname(resource_path);
            var type = ext.slice(1, ext.length); // remove the "."
            // TODO: will need to be a factory method that returns a
            // promise instead.
            return fs.readFileAsync(path.join(resources_path, resource_path), {encoding: "utf-8"}).then(function(resource_contents) {

                return new resource_class(self, type, resource_path, resource_contents);
            });
        });
    });
}

module.exports = Project;
