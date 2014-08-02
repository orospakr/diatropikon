// The status command!

var util = require("util");
var chalk = require("chalk");

var Command = require("../command");

function Status() {
    Command.call(this);
}
util.inherits(Status, Command);

Status.prototype.execute = function(project, kube) {
    logger.info("Running status!");

    return kube.getPods().then(function(pods) {
        logger.info("There are " + chalk.bold(pods.length) + " pods running.");
        pods.forEach(function(pod) {
            logger.info(pod.name);
        });
    });
};

module.exports = Status;
