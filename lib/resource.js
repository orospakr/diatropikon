var path = require("path");
var fs = require("fs");
var util = require("util");
var coffee = require("coffee-script");
var ResourceBuilder = require("./resource-builder");
var Errors = require("./errors");
var inherits = require("./inherits");
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
};

/**
   Load a resource instance from a file contents, with the specified
   source type (JSON, YAML, Coffee DSL, and so on.  Will polymorph to
   subtypes as required.  Returns a new instance.
 */
Resource.load = function(type, filename, contents) {
    logger.debug("Loading resource of type", type, "and filename", filename);
    if(type === undefined) {
        throw new Error("Type representation type (yaml, json, coffee) must be specified to Resource.load.");
    }

    var t = type.toLowerCase();

    var base = this;
    var self;

    // TODO: set id by the filename

    if(t == "json") {
        var j;
        try {
            j = JSON.parse(contents);
        } catch(e) {
            throw new DiatropikonError("Problem parsing " + filename, e);
        }

        // TODO: notice that there's a type field, and if it matches a
        self = new base(type, filename, contents);
        
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
            throw new Error("You forgot to override __resource_name in your Resource subclass: " + this);
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
        // this class, to allow DSL items to polymorph.

        // logger.debug("About to process DSL");

        // TODO: do all this for Javascript, too
        var creations = [];

        var subtypes = base.gatherSubtypes();

        subtypes.forEach(function(subType) {

            // poison the global namespace with DSL entry-point
            // methods for each subtype.
            logger.debug("Creating DSL entry point for ", subType.__resource_name);
            global[subType.__resource_name] = function(block) {
                // TODO: add sanity test to avoid users accidentally
                // using Coffee's fat arrow (=>).  grep block's source
                // for "_this" and print a warning.

                var s = new base(type, filename, contents);
                creations.push(s)
                // create a builder for it:
                var builder = new ResourceBuilder(s);
                // call the block in the context (ie., `this`) mapped
                // to the Builder.
                block.call(builder);
            };
        });


        coffee.run(contents, {filename: filename});


        // remove poisoning
        subtypes.forEach(function(subType) {
            delete global[subType.__resource_name];
        });

        if(creations.length < 1) {
            throw new DiatropikonError("Your file '" + filename + "' did not define a resource of any of " + util.inspect(subtypes));
        }
        if(creations.length > 1) {
            throw new DiatropkonError("Diatropikon does not yet support creating multiple resources per-file.");
        }
        self = creations[0];
    }
    return self;
};

Resource.gatherSubtypes = function() {
    var gathered = [this];

    if(this.subtypes !== undefined) {
        // logger.debug("Gathering all subtypes from", this.__resource_name, ", which are", util.inspect(this.subtypes.map(function(s) { return s.__resource_name})));
        this.subtypes.forEach(function(subtype) {
            // logger.debug("... checking", subtype.__resource_name);
            gathered.push.apply(gathered, subtype.gatherSubtypes());
        });
    }
    return gathered;
};

/**
   Subclass implementations should call this on their parent Resource
   type (for instance, Pod should call this on Kubernetes).  This is
   done so the polymorphic loading implemented in .load() can work.

   You must *not* use util.inherits, or our lib/inherits module
   directly!  Use this in lieu of those.

   Specify a capitalized name!
 */
Resource.registerSubtype = function(subtype, name) {
    inherits(subtype, this);
    subtype.__resource_name = name;
    // inherits will have copied the subtypes list from this (if there
    // is one) into the subtype itself, causing a pretty horrendous
    // cycling structure, which is very much not desirable.  Reset it
    // here.
    subtype.subtypes = [];

    // logger.debug("Registering ", subtype.__resource_name, "*into*", this.__resource_name, "");
    if(this.subtypes === undefined) {
        logger.debug("... and ", this.__resource_name, "lacks a subtype list, starting one");
    }
    if(subtype.gatherSubtypes().indexOf(this) !== -1) {
        throw new Error("Yikes, you tried to create a cyclic graph of Resource subtypes!");
    }

    // I need to be able to have a given resource class's load method
    // be able to determine its subclasses, of all depths.  so, load()
    // will need to walk and gather all of its subtypes.

    // in this context, "this" will be the parent (one level up) class
    // of whatever subtype is about to be registered.
    this.subtypes = this.subtypes || [];
    this.subtypes.push(subtype);
};

// is meant to be a class variable (Resource.resource_name), but not
// sure how to polymorophically refer to it so that I get subclasses'
// versions, so I'll just use an instance variable instead.
Resource.__resource_name = "OVERRIDE";

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
