// Base resource type: any item that uses a JSON/YAML/Diatropikon DSL
// definition file.

function Resource(project, type, filename, contents) {
    this.project = project;
    this.type = type;
    this.filename = filename;
    this.contents = contents;
    logger.debug("Loading resource of type", type, "and filename", filename);
};

module.exports = Resource;
