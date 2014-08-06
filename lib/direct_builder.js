// Build Docker images directly using a Docker daemon instance running
// somewhere.  Typically used for local use (boot2docker, etc.).

var util = require("util");
var Promise = require("bluebird");
var stream = require("stream");
var Docker = require("dockerode");
var fs = Promise.promisifyAll(require("fs"));

var tar = require("tar-fs");

function DirectBuilder(docker_host, docker_port) {
    logger.debug("Going to use docker host for direct build: ", docker_host);
    this.docker = Promise.promisifyAll(new Docker({host: docker_host, port: docker_port}));
}

/**
 * Build a container image.
 * @param image_path Specify the path to the directory containing the Dockerfile.
 */
DirectBuilder.prototype.build = function(image) {
    var self = this;

    logger.debug("About to package and ship Dockerfile dir to dockerd...");

    var tarrer = tar.pack(image.pathname);

    return self.docker.buildImageAsync(tarrer).then(function(docker_stream) {
        // TODO: properly handle docker's streaming output
        docker_stream.pipe(process.stdout);

        // TODO: return a promise that blocks until stream is complete
    });
};

module.exports = DirectBuilder;
