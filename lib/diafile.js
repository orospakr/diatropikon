var util = require("util");
var path = require("path");

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var coffee = require("coffee-script");

var Helpers = require("./helpers");

var DIAFILE_NAME = "Diafile";


var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;

var logger = require("./logger");

/**
 * Handles Diafiles, the entry point of your projects.
 */
function Diafile(context, contents, base_path) {
    // find the Diafile.  Do the classic walking up of each directory,
    // starting from the specified -d if there is one.

    // and then, run it.  Sadly, I can't inject a context in,
    // apparently.  So, I have to register a few things into the
    // *global* namespace in order to grant convenient access to
    // things.

    this.context = context;
    this.base_path = base_path;
    this.contents = contents;
}

/**
Load and return a Promise for a Diafile object.
*/
Diafile.new = function(context, base_path) {
    return fs.readFileAsync(path.join(base_path, DIAFILE_NAME), {encoding: "utf-8"}).then(function(diafile_contents) {
        return new Diafile(context, diafile_contents, base_path);
    });
}

/**
   Searches for the top of a Diatropikon project (indicated by the
   presence of Diafile), and, once it finds one, returns the Diafile
   object.
*/
Diafile.search = function(context, search_from) {
    var top = path.resolve(search_from);
    while (true) {
        var potential = path.join(top, DIAFILE_NAME);
        if(fs.existsSync(potential)) {
            // found one!
            logger.debug("Found a Diafile at", potential);
            return Diafile.new(context, top);
        } else {
            var new_top = path.resolve(top, "..");
            if(top == new_top) {
                // unable to back up further, so break.
                throw new DiatropikonError("Unable to find a Diafile!  Try specifying a path to your project with -d.");
            }
            top = new_top;
        }
    }
};

/**
   Load the Diafile and the rest of the project.  Returns a Promise
   for a Project instance.
*/
Diafile.prototype.load = function() {
    logger.debug("About to load Diafile DSL...");
    // poison global namespace so the Diafile can see our DSL
    // entry-point helper method (`diatropikon()`).  Alas there's no
    // better way to do this. :(
    Helpers.poison(this.context, this.base_path, global);


    coffee.run(this.contents, {filename: this.base_path});

    return global.diatropikon_diafile_promise;

    // now that that's been run, Helpers.prototype.diatropikon, as the
    // DSL entry point, will have put a promise the global object for
    // us to retrieve.  we do this because there's no way to return an
    // object from coffee.run, so we have to use a "pass through
    // global" method to retrieve it.
};

module.exports = Diafile;
