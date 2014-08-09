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
        logger.info("There are " + chalk.bold(pods.length) + " pods pushed.");
        pods.forEach(function(pod) {

            logger.info(pod.id);

            // TODO: correllate the pods and the containers they
            // contain with their definitions in the Project.  Ie.,
            // report if any are missing, indicate if 
            if(pod.currentState !== undefined && pod.currentState.info !== undefined) {
                for (container_key in pod.currentState.info) {
                    // TODO: look the container up in the definition
                    if(pod.currentState.info.hasOwnProperty(container_key) && container_key !== "net") {
                        logger.info("... container: ", chalk.bold(container_key));
                        logger.info("            ...", chalk.bold(pod.currentState.info[container_key].State.Running ? "Running" : "Not running :("));
                    }
                }
            } else {
                logger.info("...", chalk.red("is not yet running any containers."));
            }


            // currentState.info.CONTAINERS.State.Running
            // TODO: factor this out into a templating system.


                // logger.info(" ... running on host:", util.inspect(pod.currentState));
        });
    });
};

module.exports = Status;
