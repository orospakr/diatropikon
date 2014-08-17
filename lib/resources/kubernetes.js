var util = require("util");
var path = require("path");
var fs = require("fs");

var Validator = require("jsonschema").Validator;

var Resource = require("../resource");

function Kubernetes(type, filename, contents) {
    Kubernetes.super_.apply(this, arguments);
}
Resource.registerSubtype(Kubernetes, "Kubernetes");

// synchronously load and set up the validator (heck, we load all of
// the JS code synchronously anyway!).
Kubernetes.loadValidator = function(name) {
    // this will be found to the Resource class itself.
    var schema_path = path.join(__dirname, "kubernetes", "kubernetes_rest_schema", name + "-schema.json");

    // doing it synchronously because we're doing it at startup
    // alongside node's synchronous loading of javascript, anyway.
    var schema_contents = fs.readFileSync(schema_path, {encoding: "utf-8"});

    var validator = new Validator();
    // curry the validate method from the validator with my loaded
    // schema to make it available to toJson().
    this.prototype.validate = function(output_json) {
        validator.validate(output_json, JSON.parse(schema_contents), {throwError: true});
    };
}

module.exports = Kubernetes;
