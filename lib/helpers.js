var util = require("util");
var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;

var Project = require("./project");

// Helpers meant to be injected globally, for the benefit of Diafile.
function Helpers() {
}

Helpers.prototype.diatropikon = function(context, base_path, version, name, description_block) {
    // execute the block in a context with all of our DSL!

    if (version !== 0.1) {
        throw new DiatropikonError("This project is intended for a different version of Diatropikon.");
    }

    if (name === undefined) {
        throw new DiatropikonError("You must specify a name for your project in Diafile.")
    }


    // TODO: it might be better to drive the creation of our Project
    // object from here.  However, Promise's constructor gives us a
    // promise, we'll need to return a promise back out through to the
    // other side (will be in project.js) that is executing the
    // Diafile coffeescript.  So, we'll have to toss that through
    // global, sigh.
    logger.debug("diatropikon() DSL entry point helper called.");
    global.diatropikon_diafile_promise = Project.new(context, base_path, name);
}

Helpers.poison = function(context, base_path, target) {
    // copy all of my members into the target object.  Used to poison
    // the global namespace.

    for(k in Helpers.prototype) {
        if (Helpers.prototype.hasOwnProperty(k)) {
            target[k] = function() {
                // curry the this (it'll just be the global, oh well)
                // and the context onto the helper method.
                Helpers.prototype[k].apply(target, [context, base_path].concat(Array.prototype.slice.call(arguments, 0)));
            };
        }
    }
}

module.exports = Helpers;
