// The status command!

import util = require("util");

import command = require("../command");


var chalk = require("chalk");

var logger = require("../logger");

var Errors = require("../errors.js");
var DiatropikonError = Errors.DiatropikonError;
var KubernetesError = Errors.KubernetesError;

var Promise = require("bluebird");


export class Status extends command.Command {
  
  execute(project, kube) {
    logger.info("Running status!");

    return kube.getPods().then(function(pods) {
        logger.info("There are " + chalk.bold(pods.length) + " pods pushed.");
        pods.forEach(function(pod) {

            logger.info(pod.id);

            // TODO: correlate the pods and the containers they
            // contain with their definitions in the Project.  Ie.,
            // report if any are missing, indicate if
            if(pod.currentState !== undefined && pod.currentState.info !== undefined) {
                for (var container_key in pod.currentState.info) {
                    // TODO: look the container up in the definition
                    if(pod.currentState.info.hasOwnProperty(container_key) && container_key !== "net") {
                        // the info values are docker.Container structs.
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
  }
}