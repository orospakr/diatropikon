
var util = require("util");
var Promise = require("bluebird");
var stream = require("stream");
var Docker = require("dockerode");
var fs = Promise.promisifyAll(require("fs"));
var DiatropikonError = require("./errors").DiatropikonError;

var tar = require("tar-fs");

function DockerError(message, reason) {
    DiatropikonError.call(this, message, reason);
}
util.inherits(DockerError, DiatropikonError);


function DockerLogWriter(options, closed_cb) {
    stream.Writable.call(this, options);
}
util.inherits(DockerLogWriter, stream.Writable);

DockerLogWriter.prototype._write = function(chunk, encoding, callback) {
    var unpacked = JSON.parse(chunk.toString());
    if(unpacked.errorDetail !== undefined) {
        logger.error("Docker image build failed: ", unpacked.errorDetail.message);
        throw new DockerError(unpacked.errorDetail.message);
    } else if(unpacked.stream !== undefined) {
        logger.info("Docker:", unpacked.stream.trim());
    } else if(unpacked.status !== undefined) {
        logger.warn("Docker status: ", unpacked.status.trim());
    } else {
        logger.warn("Unexpected Docker event stream event: ", util.inspect(unpacked));
    }
    callback();
};


/** Build Docker images directly using a Docker daemon instance
 * running somewhere.  Typically used for local use (boot2docker,
 * etc.).  Does not deal with shipping the built image anywhere.  Some
 * deployments may prefer quay.io's "automated build repositories"
 * instead of this.
 */

function DirectBuilder(project, docker_host, docker_port) {
    this.project = project;
    logger.debug("Going to use docker host for direct build: ", docker_host);
    this.docker = Promise.promisifyAll(new Docker({host: docker_host, port: docker_port}));
}

/**
 * Build a container image.
 * @param image_path Specify the path to the directory containing the Dockerfile.
 */
DirectBuilder.prototype.build = function(image) {
    var self = this;
    // TODO: sanitize project name string into something safe and
    // unixy for this, and also make proper version tag and then add
    // "latest" with a separate docker call.
    var image_tag = self.project.name + "_" + image.name + ":latest";

    logger.info("About to package and ship Dockerfile dir to dockerd, will tag it as", image_tag);

    var tarrer = tar.pack(image.pathname);

    // now, I need to create a repository name and tag for this, so I
    // can retrieve the results in the event of success.

    return self.docker.buildImageAsync(tarrer, {t: image_tag}).then(function(docker_stream) {
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
    }).catch(Promise.OperationalError, function(err) {
        throw new DiatropikonError("Problem talking to docker", err);
    }).then(function() {
        // image is built! 

        // TODO: scrape (ugh) the image ID out of the final log
        // message that arrived in the stream.  While using the tags we made is good enough, it would be more robust to identify the 

        return image_tag;

        // need to modify Dockerode to allow me to download image
        // tarballs (do a get on an image to get the JSON, then modify
        // the Dockerode active record object that's come back, since
        // I can't modify the Dockerode classes directly because they
        // are hidden).
    });
};

module.exports = DirectBuilder;
