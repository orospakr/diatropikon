// The status command!

var util = require("util");

var Command = require("../command");

function Status() {
    Command.call(this);
}
util.inherits(Status, Command);

Status.prototype.execute = function(project) {
    logger.info("Running status!");
};

module.exports = Status;
