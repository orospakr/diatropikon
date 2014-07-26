// Operation base class.
var util = require("util");

function Operation(callback) {
    this.callback = callback;
};

Operation.prototype.execute = function(context) {
    // meant to be overridden!
};

module.exports = Operation;
