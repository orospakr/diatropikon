// The deploy command!

import util = require("util");

import command = require("../command");

var logger = require("../logger");

var Errors = require("../errors.js");
var DiatropikonError = Errors.DiatropikonError;
var KubernetesError = Errors.KubernetesError;

var Promise = require("bluebird");

/**
 * Ensure that your project definition has been fully pushed into the Kubernetes
 * environment.
 */
export class Deploy extends command.Command {
  execute(project, kube) {
    logger.info("Running deploy!");

    return Promise.all(project.pods.map(function(pod) {
        // use name, not filename, here
        logger.info("Pushing pod", pod._filename);

        return kube.postPod(pod.toJson()).catch(KubernetesError, function(err) {
            throw new DiatropikonError("Problem pushing pod '" + pod.id + "'", err);
        });
    })).then(function() {
        return Promise.all(project.services.map(function(service) {
            logger.info("Pushing service", service._filename);
            return kube.postService(service.toJson());
        }));
    });
  }
}