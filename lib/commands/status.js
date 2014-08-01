// The status command!

var util = require("util");

var Command = require("../command");

function Status() {
    Command.call(this);
}
util.inherits(Status, Command);

Status.prototype.execute = function(project, kube) {
    logger.info("Running status!");

    return kube.getPods().then(function(pods) {
        logger.info("There are " + pods.length + " pods running.");
    });
};

module.exports = Status;
