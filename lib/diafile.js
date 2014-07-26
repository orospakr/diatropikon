// Diafiles.
var fs = require("fs");
var coffee = require("coffee-script");
var path = require("path");

var DIAFILE_NAME = "Diafile";

var Helpers = require("./helpers");

// poison global namespace with our helpers so the Dialfile can see
// them.  Alas there's no better way to do this. :(
Helpers.poison(global);

function Diafile(context) {
    // find the Diafile.  Do the classic walking up of each directory,
    // starting from the specified -d if there is one.

    // find your Diafile...
    context.project_directory

    var top = path.resolve(context.project_directory);
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

    if(diafile == undefined) {
        throw new Error("Unable to find a Diafile!  Try specifying a path to your project with -d.");
    }

    // and then, run it.  Sadly, I can't inject a context in, apparently.  So, I have to register a few things into the *global* namespace in order to grant convenient access to things
    coffee.run(fs.readFileSync(diafile).toString(), {filename: diafile});
    
}

module.exports = Diafile;
