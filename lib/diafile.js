// Diafiles.
var fs = require("fs");
var coffee = require("coffee-script");

var Helpers = require("./helpers");

// poison global namespace with our helpers so the Dialfile can see
// our DSL entry-point helper method (`diatropikon()`).  Alas there's
// no better way to do this. :(
Helpers.poison(global);

function Diafile(context, diafile_path) {
    // find the Diafile.  Do the classic walking up of each directory,
    // starting from the specified -d if there is one.

    // find your Diafile...



    // and then, run it.  Sadly, I can't inject a context in, apparently.  So, I have to register a few things into the *global* namespace in order to grant convenient access to things
    coffee.run(fs.readFileSync(diafile_path).toString(), {filename: diafile_path});
    
}

module.exports = Diafile;
