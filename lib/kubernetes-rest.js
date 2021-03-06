'use strict';

var Promise = require("bluebird");

var util = require("util");
var Errors = require("./errors");
var KubernetesError = Errors.KubernetesError;

// it's kind of hilarious that this is a thing.
var request = Promise.promisifyAll(require("request"));

var requestAsync = Promise.promisify(require("request"));

var Resource = function(name, kubernetesClient) {
    this.name = name;
    this.kubernetesClient = kubernetesClient;
};

Resource.prototype.all = function() {
    return this.kubernetesClient.executeRequest(this.name, "GET");
};

// TODO es6: optional args
function KubernetesClient(base_url) {
    this.base_url = base_url;
    if(base_url === undefined) {
        throw new Error("KubernetesClient must be given a base URL.");
    }

    // create the resources!
    this.pods = new Resource("pods", this);
    this.containers = new Resource("containers", this);
    this.replicationControllers = new Resource("replicationControllers", this);
    this.services = new Resource("services", this); 
    this.operations = new Resource("operations", this);
};

KubernetesClient.Resource = Resource;

/**
Process an answer and return a list of the returns items (as flat JSON objects).
*/
KubernetesClient.prototype.processAnswer = function(json, expectedType) {
    if(expectedType !== undefined && json.kind !== expectedType) {
        throw new Error("Received unexpected type '" + json.kind + "' back from the API.");
    }
    return json.items;
};

/* Execute a function against Kuberetes' apiserver */
KubernetesClient.prototype.executeRequest = function(path, options) {
    var self = this;
    options = options || {};
    var method = options.method || "GET";

    var p = self.base_url + "/api/v1beta1/" + path
    logger.debug("Kube request:", method, p);

    return requestAsync(p, {
        method: method,
        body: options.body
    }).spread(function(contents, body) {
        if(contents.statusCode !== 200) {
            // TODO es6: string interpolation.
            throw new KubernetesError("Status code was " + contents.statusCode + ", message: " + body);
        }
        
        return self.processAnswer(JSON.parse(contents.body), options.expectedType);
    }).catch(Promise.OperationalError, function(e) {
        //            console.log("Unable to reach API: " + e);
        throw new KubernetesError("Unable to reach API: " + e.toString(), e);
    });
};

/*
 * Test connectivity to a Kubernetes API server instance for your
 * cluster and validate that it's reachable and sane.
 */
KubernetesClient.prototype.ping = function() {
    var self = this;
    logger.debug("Pinging Kubernetes...");
    return self.executeRequest("pods").then(function(ans) {
        logger.debug("... success.");
    });
};

KubernetesClient.prototype.getPods = function() {
    return this.executeRequest("pods", {
        method: "GET",
        expectedType: "PodList"
    });
};

KubernetesClient.prototype.postPod = function(pod_json) {
    return this.executeRequest("pods", {
        method: "POST",
        expectedType: "Pod",
        body: JSON.stringify(pod_json)
    });
};

KubernetesClient.prototype.postService = function(service_json) {
     return this.executeRequest("services", {
        method: "POST",
        expectedType: "Service",
        body: JSON.stringify(service_json)
    });
};

module.exports = KubernetesClient;
