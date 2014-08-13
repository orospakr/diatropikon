var path = require("path");
var fs = require("fs");
var util = require("util");
var coffee = require("coffee-script");
var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;

// Base resource type: any item that uses a JSON/YAML/Diatropikon DSL
// definition file.  TODO: right now, this is a bit
// Active-Record-pattern-ish.  It might be meaningful to split apart
// object state from the data marshalling/validation stuff, turning it
// into more of a DAO.
function Resource(type, filename, contents) {
    var self = this;
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

        // TODO: notice that there's a type field, and if it matches a
        // valid 
        
        for(k in j)  {
            if(j.hasOwnProperty(k)) {
                self[k] = j[k];
            }
        }
    } else if(t == "coffee") {
        // create a method named by our resource name, and install it
        // into the global namespace, in order to have our entry
        // point.

        // TODO: so, we want the option of polymorphing into a
        // subclass of this resource type.  this'd be used primarily
        // by environments.  while most of our object type selection
        // happens on subdirectories, like the Kubernetes types,
        // environments don't benefit from being sorted into
        // subdirectories, and moreover, selection of an Environment
        // resource by name will result in an Environment of arbitrary
        // type, but the user flows for selecting base Kube resource
        // types by name are usually from entirely different user
        // flows that already know the type ahead of time.  So, while
        // we need to support both, I should only support inline type
        // specification with subtypes of the type we expect from the
        // directory name.

        if(this.__resource_name === undefined || this.__resource_name === "OVERRIDE") {
            throw new Error("You forgot to override __resource_name in your Resource subclass!");
        }

        // so, rather than binding to this existing Resource, the
        // Coffee entry point should itself return a brand new
        // instance.  However, we're already in the constructor (SWEET
        // -- my plan for moving this out of the constructor to handle
        // the polymporphism issue solves this, too) Ideally, what we
        // should do is, have this as a .new that returns a new object
        // if resource type is flat, or rather has the entry point
        // manufacture the new instance if type is DSL.

        // TODO create global entry points for each known subtype of
        // this class, to allow DSL items to poly
        global[this.__resource_name] = function(cb) {
            // TODO: add sanity test to avoid users accidentally using
            // Coffee's fat arrow (=>).  grep cb's source for "_this"
            // and print a warning.
            
            // TODO: so, rather than calling the block with `this` set
            // to the instance of the resource itself being built,
            // instead, we're going to create a builder object that
            // has all of the DSL shininess.  It'll have a `target`
            // property for getting the actual resource object as an
            // escape valve.
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

/**
   Confirm that this resource's current state is valid for submission
   to whatever external system it might be bound to.
 */
Resource.prototype.validate = function(output_json) {
    // override this in subclasses.
};

// strip out our inband context fields by doing a shallow copy.  a bit
// silly, but it'll have to do.
Resource.prototype.toJson = function() {
    var o = {};
    for (field in this) {
        if(this.hasOwnProperty(field) && field[0] !== "_") {

            // if the field is defined as a sub-resource (like
            // Pod->Manifest), then we need to invoke it.  Sadly, the
            // code paths are necessarily different depending on
            // whether it's loading Coffee (in that case, use the same
            // Coffee entry point as above), or flat marshalling
            // (JSON, YAML, etc., in which case we need to notice that
            // subfield and interject the subresource there somehow).
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
