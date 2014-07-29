var Operation = require("./operation");

var util = require("util");

function Command() {
    Operation.call(this);
};
util.inherits(Command, Operation);

Command.prototype.summary = "UNSET!";

module.exports = Command;
