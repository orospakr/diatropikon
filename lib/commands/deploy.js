// The deploy command!

var util = require("util");

var Command = require("../command");

function Deploy() {
    Command.call(this);
}
util.inherits(Deploy, Command);

Deploy.prototype.execute = function(project, kube) {
    logger.info("Running deploy!");

    logger.debug("Pushing pods...");
    project.pods
};

module.exports = Deploy;
