// The Build command!  Build all of our docker container images.

var util = require("util");
var chalk = require("chalk");

var Promise = require("bluebird");

var DirectBuilder = require("../direct_builder.js");

var Command = require("../command");

function Build() {
    Command.call(this);
}
util.inherits(Build, Command);

Build.prototype.execute = function(project, kube) {
    logger.info("Running build!");
    // TODO: this should be injected
    var builder = new DirectBuilder(project, project.env.getBuilderDockerHost(), project.env.getBuilderDockerPort());
    return Promise.map(project.images, function(image) {
        logger.info("BUILDING IMAGE");
        return builder.build(image);
    });
};

module.exports = Build;
