var util = require("util");

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var coffee = require("coffee-script");

var Helpers = require("./helpers");

// poison global namespace with our helpers so the Dialfile can see
// our DSL entry-point helper method (`diatropikon()`).  Alas there's
// no better way to do this. :(
Helpers.poison(global);

/**
 * Handles Diafiles, the entry point of your projects.
 */
function Diafile(context, contents, path) {
    // find the Diafile.  Do the classic walking up of each directory,
    // starting from the specified -d if there is one.

    // find your Diafile...



    // and then, run it.  Sadly, I can't inject a context in, apparently.  So, I have to register a few things into the *global* namespace in order to grant convenient access to things
    coffee.run(contents, {filename: path});
    
}

// making a "new" factory constructor so as to allow for returning a
// promise.
Diafile.new = function(context, path) {
    return fs.readFileAsync(path, {encoding: "utf-8"}).then(function(diafile_contents) {
        new Diafile(context, diafile_contents, path);
    });
}

module.exports = Diafile;
