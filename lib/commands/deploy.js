// The deploy command!

var util = require("util");

var Command = require("../command");

function Deploy() {
    Command.call(this);
}
util.inherits(Deploy, Command);

Deploy.prototype.execute = function(project) {
    logger.info("Running deploy!");
};

module.exports = Deploy;
