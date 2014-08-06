// Build Docker images directly using a Docker daemon instance running
// somewhere.  Typically used for local use (boot2docker, etc.).

var util = require("util");
var Promise = require("bluebird");
var stream = require("stream");
var Docker = require("dockerode");
var fs = Promise.promisifyAll(require("fs"));

var tar = require("tar-fs");

function DockerLogWriter(options, closed_cb) {
    stream.Writable.call(this, options);
}
util.inherits(DockerLogWriter, stream.Writable);

DockerLogWriter.prototype._write = function(chunk, encoding, callback) {
    var unpacked = JSON.parse(chunk.toString());
    logger.info("Docker:", unpacked.stream.trim());
    callback();
};


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
        return new Promise(function(resolve, reject) {
            var log_writer = new DockerLogWriter();
            docker_stream.pipe(log_writer);

            docker_stream.on("end", function() {
                logger.debug("Docker image build complete!");
                resolve();
            });

            docker_stream.on("error", function(err) {
                reject(err);
            });
        });
    });
};

module.exports = DirectBuilder;
