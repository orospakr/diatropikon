// Represents the user's project.

var path = require("path");
var Diafile = require("./diafile");
var Promise = require("bluebird");

var fs = Promise.promisifyAll(require("fs"));

var Container = require("./resources/container.js");

var DIAFILE_NAME = "Diafile";

function Project(context, search_from) {
    this.context = context;

    var self = this;

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

    this.top_level = top;

    if(diafile == undefined) {
        throw new Error("Unable to find a Diafile!  Try specifying a path to your project with -d.");
    }

    var diafile_processed = new Diafile(this.context, diafile);

    // load environment

    // now, begin loading the resources.

    // load images
    // load containers
    self.loadResources(Container, "containers");

    // how do I handle my recursive-resolution feature? I think I
    // should maybe leave it out for now.
    
    

    // load pods
    // load replication controllers
    // load services
}

Project.prototype.loadResources = function(resource_class, resource_name) {
    var self = this;

    var resources_path = path.join(this.top_level, resource_name);
    
    return fs.readdirAsync(resources_path).then(function(resources_dir_contents) {
        return Promise.map(resources_dir_contents.filter(function(resource_path) {
            // filter out filenames that aren't from our list
            var ext = path.extname(resource_path).toLowerCase();
            return [".coffee", ".litcoffee", ".json", ".yaml"].indexOf(ext) !== -1;
        }), function(resource_path) {
            var ext = path.extname(resource_path);
            var type = ext.slice(1, ext.length); // remove the "."
            // TODO: will need to be a factory method that returns a
            // promise instead.
            return fs.readFileAsync(path.join(resources_path, resource_path), {encoding: "utf-8"}).then(function(resource_contents) {
                console.log(resource_contents);
                return new resource_class(self, type, resource_path, resource_contents);
            });
        });
    }).then(function(resources) {
        logger.debug("Got resources:", resources);
    }).catch(function(err) {
        if(err.code === "ENOENT")
            logger.warn("No '" + resource_name + "' directory.");
        else
            logger.error("Unexpected error: ", err.stack);
    });
}

module.exports = Project;
