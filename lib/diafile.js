// Diafiles.
var fs = require("fs");
var coffee = require("coffee-script");

function Diafile() {
    // find the Diafile.  Do the classic walking up of each directory,
    // starting from the specified -d if there is one.

    // find your Diafile
    coffee.run(fs.readFileSync('Diafile').toString());

}
