// Represents the user's project.

var util = require("util");
var path = require("path");
var Promise = require("bluebird");

var fs = Promise.promisifyAll(require("fs"));

var Image = require("./resources/image.js");
var Pod = require("./resources/kubernetes/pod.js");
var Service = require("./resources/kubernetes/service.js");

var Environment = require("./resources/environment");

var KubernetesClient = require("./kubernetes-rest");
var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;
var KubernetesError = Errors.KubernetesError;

function Project(context, base_path, name) {
    this.base_path = base_path;
    this.context = context;
    this.name = name;
    // how do I handle my recursive-resolution feature? I think I
    // should maybe leave it out for now.
}

Project.new = function(context, base_path, name) {
    var self = new Project(context, base_path, name);

    var images_path = path.resolve(path.join(self.base_path, "images"));


        // TODO: do a promise.all for all for all of the
        // resources. but, ideally ensure they're synchronously (that
        // is, in deterministic order) loaded.

        // load images
        // load containers

        // load pods
        // load replication controllers
        // load services

    return Promise.all([
        self.loadResources(Service, "services").then(function(services) {
            self.services = services;
        }), self.loadResources(Pod, "pods").then(function(pods) {
            self.pods = pods;
        })
    ]).then(function(all_resources) {
        // now, to load the current environment.

        var env_path = path.resolve(path.join(self.base_path, "environments", self.context.environmentName() + ".yaml"));

        return Environment.new(self, env_path);
    }).then(function(env) {
        self.env = env;
        return fs.readdirAsync(images_path)
    }).catch(function(err) {
        return err.cause !== undefined && err.cause.code == "ENOENT";
    }, function(not_found_err) {
        logger.debug("This project has no images directory.");
        return []; // empty images list, pass it along and keep the
                   // pipeline going.
    }).then(function(images_dir_contents) {
        return Promise.filter(images_dir_contents, function(image_dir) {
            // test that it has a dockerfile!
            logger.debug("going to test that ", path.join(images_path, image_dir, "Dockerfile"), "exists");
            // not using fs.exists because its signature does not
            // conform to standard node callback spec, which screws
            // promisify.
            return fs.statAsync(path.join(image_dir, "Dockerfile")).catch(function(err) {
                return false;
            }).then(function(stats) {
               return true; 
            });
        });
    }).map(function(valid_image_dir) {
        logger.debug(valid_image_dir);
        return new Image(self, valid_image_dir, path.join(images_path, valid_image_dir));
    }).then(function(images) {
        logger.debug("loaded images: ", util.inspect(images));
        self.images = images;
        return self;
    });
};

// Returns a list of all the loaded resources for the given type.
Project.prototype.loadResources = function(resource_class, resource_name) {
    var self = this;

    var resources_path = path.resolve(path.join(this.base_path, resource_name));

    return fs.readdirAsync(resources_path).catch(function(err) {
        // alas for untyped errors.  Bluebird can't *entirely* fix
        // Node.js for us. :P
        if(err.cause !== undefined && err.cause.code === "ENOENT") {
            logger.warn("No '" + resource_name + "' directory.");
            return []; // empty list of resources of this type, keep
                       // the pipeline going.
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
            var ext = path.extname(resource_path);
            var type = ext.slice(1, ext.length); // remove the "."
            // TODO: will need to be a factory method that returns a
            // promise instead.
            return fs.readFileAsync(path.join(resources_path, resource_path), {encoding: "utf-8"}).then(function(resource_contents) {
                // instantiate the Resource class! (new Resource)
                return new resource_class(type, path.join(resources_path, resource_path), resource_contents);
            });
        });
    });
}

module.exports = Project;
