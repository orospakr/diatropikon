var Operation = require("./operation");

var util = require("util");

function Command(callback) {
    Operation.call(this, callback);
};
util.inherits(Command, Operation);

Command.prototype.summary = "UNSET!";

module.exports = Command;
