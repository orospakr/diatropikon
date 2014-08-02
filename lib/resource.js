var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;

// Base resource type: any item that uses a JSON/YAML/Diatropikon DSL
// definition file.
function Resource(project, type, filename, contents) {
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
};

// strip out our inband context fields by doing a shallow copy.  a bit
// silly, but it'll have to do.
Resource.prototype.toJson = function() {
    var o = {};
    for (field in this) {
        if(this.hasOwnProperty(field) && field[0] !== "_") {
            o[field] = this.field;
        }
    }
    return o;
};

module.exports = Resource;
