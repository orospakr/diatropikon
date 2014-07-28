'use strict';

var Promise = require("bluebird");

var util = require("util");


// it's kind of hilarious that this is a thing.
var request = Promise.promisifyAll(require("request"));


var Resource = function(name, kubernetesClient) {
    this.name = name;
    this.kubernetesClient = kubernetesClient;
};

Resource.prototype.all = function() {
    return this.kubernetesClient.executeRequest(this.name, "GET");
};

// TODO es6: optional args
function KubernetesClient(base_url) {
    this.base_url = base_url || "http://localhost:8080";

    // create the resources!
    this.pods = new Resource("pods", this);
    this.containers = new Resource("containers", this);
    this.replicationControllers = new Resource("replicationControllers", this);
    this.services = new Resource("services", this); 
    this.operations = new Resource("operations", this);
};

KubernetesClient.Resource = Resource;

/* Execute a function against Kuberetes' apiserver */
KubernetesClient.prototype.executeRequest = function(path, method) {
    var self = this;
    method = method || "GET";
    return new Promise(function(resolve, reject) {
        // fetch the pods list to see how it goes.
        request.getAsync(self.base_url + "/api/v1beta1/" + path).spread(function(contents, body) {
            // console.log(contents);
            if(contents.statusCode !== 200) {
                // TODO es6: string interpolation.
                throw new Error("Status code was " + contents.statusCode);
            }
            // so, right now apiserver returns `text/plain`, so we
            // have to manually parse it.

            // TODO: there's a json-schema available. Should I be
            // validating against it?  Maybe ultimately, once things
            // are a little more stable (validating all my output is
            // probably a good check, but greedily validating all of
            // apiserver's output here, however, may violate Postel's
            // law...)
            resolve(JSON.parse(contents.body));
        }).catch(function(e) {
            console.log("Unable to reach API: " + e);
            reject(e);
        });
    });
};

/*
 * Test connectivity to a Kubernetes API server instance for your
 * cluster and validate that it's reachable and sane.
 */
KubernetesClient.prototype.ping = function() {
    var self = this;
    return self.executeRequest("pods");
};

module.exports = KubernetesClient;
