var path = require("path");
var fs = require("fs");
var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;

var Validator = require("jsonschema").Validator;

// Base resource type: any item that uses a JSON/YAML/Diatropikon DSL
// definition file.  TODO: right now, this is a bit
// Active-Record-pattern-ish.  It might be meaningful to split apart
// object state from the data marshalling/validation stuff.
function Resource(project, type, filename, contents) {
    var self = this;
    this._project = project;
    this._type = type;
    this._filename = filename;
    this._contents = contents;
    logger.debug("Loading resource of type", type, "and filename", filename);

    var j;
    try {
        j = JSON.parse(contents);
    } catch(e) {
        throw new DiatropikonError("Problem parsing " + filename, e);
    }

    for(k in j)  {
        if(j.hasOwnProperty(k)) {
            self[k] = j[k];
        }
    }
};

// is meant to be a class variable (Resource.resource_name), but not
// sure how to polymorophically refer to it so that I get subclasses'
// versions, so I'll just use an instance variable instead.
Resource.prototype.__resource_name = "OVERRIDE";

// synchronously load and set up the validator (heck, we load all of
// the JS code synchronously anyway!).
Resource.loadValidator = function(name) {
    // this will be found to the Resource class itself.
    var schema_path = path.join(__dirname, "kubernetes_rest_schema", name + "-schema.json");

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

// strip out our inband context fields by doing a shallow copy.  a bit
// silly, but it'll have to do.
Resource.prototype.toJson = function() {
    var o = {};
    for (field in this) {
        if(this.hasOwnProperty(field) && field[0] !== "_") {
            o[field] = this[field];
        }
    }

    // use JSON schema to validate outgoing resources in order to
    // uphold Postel's Law (avoiding submitting invalid resources to
    // Kubernetes apiserver) and also aid the user.
    try {
        this.validate(o);
    } catch(e) {
        throw new DiatropikonError("Problem validating your " + this.__resource_name + " " + this._filename, e);
    }

    return o;
};

// TODO: prevent submission of currentState, even though the schema
// technically permits it.

module.exports = Resource;
