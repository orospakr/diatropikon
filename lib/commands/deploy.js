// The deploy command!

var util = require("util");

var Command = require("../command");

function Deploy() {
    Command.call(this);
}
util.inherits(Deploy, Command);

Deploy.prototype.execute = function(project, kube) {
    logger.info("Running deploy!");

    project.containers.forEach(function(container) {
        // use name, not filename, here
        logger.info("Pushing", container._filename);
        logger.info("PUSHING\n", util.inspect(container.toJson()));
    });
};

module.exports = Deploy;
