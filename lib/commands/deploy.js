// The deploy command!

var util = require("util");

var Command = require("../command");

function Deploy(callback) {
    Command.call(this, callback);

}
util.inherits(Deploy, Command);

Deploy.prototype.execute = function(context) {
    console.log("Deploy!");
    console.log(context.project_directory);
};

module.exports = Deploy;
