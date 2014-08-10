var path = require("path");
var fs = require("fs");
var util = require("util");
var coffee = require("coffee-script");
var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;

var Validator = require("jsonschema").Validator;

// Base resource type: any item that uses a JSON/YAML/Diatropikon DSL
// definition file.  TODO: right now, this is a bit
// Active-Record-pattern-ish.  It might be meaningful to split apart
// object state from the data marshalling/validation stuff, turning it
// into more of a DAO.
function Resource(project, type, filename, contents) {
    var self = this;
    this._project = project;
    this._type = type;
    this._filename = filename;
    this._contents = contents;
    logger.debug("Loading resource of type", type, "and filename", filename);

    var t = type.toLowerCase();

    // TODO: set id by the filename

    if(t == "json") {
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
    } else if(t == "coffee") {
        // create a method named by our resource name, and install it
        // into the global namespace, in order to have our entry
        // point.

        if(this.resource_name !== undefined && this.__resource_name == "OVERRIDE") {
            return new Error("You forgot to override __resource_name in your Resource subclass!");
        }

        global[this.__resource_name] = function(cb) {
            // TODO: add sanity test to avoid users accidentally using
            // Coffee's fat arrow (=>).  grep cb's source for "_this"
            // and print a warning.
            cb.call(self);
        }.bind(this);
        coffee.run(this._contents, {filename: filename});

        // remove poisoning
        global[this.__resource_name] = undefined;
    }
};

/**
   This is so DSL code can set values we didn't think of, at least for
   now.
 */
Resource.prototype.set_value = function(k, v) {
    this[k] = v;
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
