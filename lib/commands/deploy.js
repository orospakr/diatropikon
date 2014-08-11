// The deploy command!

var util = require("util");

var Command = require("../command");

var Errors = require("../errors.js");
var DiatropikonError = Errors.DiatropikonError;
var KubernetesError = Errors.KubernetesError;

var Promise = require("bluebird");

function Deploy() {
    Command.call(this);
}
util.inherits(Deploy, Command);

Deploy.prototype.execute = function(project, kube) {
    logger.info("Running deploy!");

    return Promise.all(project.pods.map(function(pod) {
        // use name, not filename, here
        logger.info("Pushing pod", pod._filename);


        logger.info("PUSHING\n", util.inspect(pod.toJson()));

        return kube.postPod(pod.toJson()).catch(KubernetesError, function(err) {
            throw new DiatropikonError("Problem pushing pod '" + pod.id + "'", err);
        });
    })).then(function() {
        return Promise.all(project.services.map(function(service) {
            return kube.postService(service.toJson());
        }));
    });
};

module.exports = Deploy;
