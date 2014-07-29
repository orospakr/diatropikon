// Operation base class.
var util = require("util");

function Operation() {

};

Operation.prototype.execute = function(project) {
    // meant to be overridden!
};

module.exports = Operation;
