// The Build command!  Build all of our docker container images.

var util = require("util");
var chalk = require("chalk");

var Promise = require("bluebird");

var DirectBuilder = require("../direct_builder.js");

var Command = require("../command");

function Build() {
    Command.call(this);
}
util.inherits(Build, Command);

Build.prototype.execute = function(project, kube) {
    logger.info("Running build!");

    // For now, until Kube supports running one-off jobs (with
    // containers with "privileged mode" turned on to allow nesting),
    // we need to reach out to an *existing* dockerd already running
    // in our cluster (or elsewhere) in order to build images.

    // Now, we have to strategically decide how and when to ship
    // images from the build location (which *may* be a node!) to all
    // of nodes that will run the kube job.  we don't want to be
    // piping bits through the user's laptop if ever avoidable.  If
    // it's a single nod deployment, it's easy, because the image will
    // be on that docker node used by that kubelet already.  Now, say
    // you have a simple environment consisting of two nodes, we have
    // to ship that image to the other node.  We still do not want to
    // ship through the user's laptop, because asymmetric home ISP
    // horrors.

    // now, the right answer might be to always deploy a Pod
    // containing Docker Index (using an image from the public Docker
    // Hub, to avoid chicken/egg issues) in the most basic mode (ie.,
    // a singleton with storage on a UNIX fs, which doesn't scale for
    // shit but is great for getting started and won't depend on Riak
    // CS), and shove the things through that.

    // TODO: this should be injected
    var builder = new DirectBuilder(project, project.env.getBuilderDockerHost(), project.env.getBuilderDockerPort());
    return Promise.map(project.images, function(image) {
        return builder.build(image);
    });
};

module.exports = Build;
