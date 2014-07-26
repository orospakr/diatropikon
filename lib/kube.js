'use strict';

var KubernetesClient = require("./kubernetes-rest.js");

var chalk = require("chalk");

var nomnom = require("nomnom");

nomnom.command('init')
    .help("Initialize a new Kube project")
    .options({
              'directory': {position: 0, required: true, help: "Create new Kube project in the specified directory"}})
    .callback(function(opts) {
        // user called init!
        console.log("init!");
    });

nomnom.command('generate')
    .help("Generate a definition of a new Kubernetes resource")
    // TODO crap, commands are not nestable. a single positional
    // argument seems to do the trick, but I want to be able to put
    // separate options inside each, all discoverable with `kube
    // generate pod --help`, for instance.
    .options({
        "type": {position: 0, required: true, help: "Specify type of resource to be generated"}
    });

nomnom.command('up')
    .help("Start up or provision the hosting environment, idempotently");

nomnom.command('build')
    .help("Build (or fetch) all of the Docker container images in the current environment");

nomnom.command('deploy')
    .help("Sync all container/pod/service/replicator definitions into your Kubernetes cloud, idempotently")
    .options({
        "dry": {help: "Do not modify any state, merely show what would be done"}
    });

nomnom.command('status')
    .help("Show what's up to date in the current environment");


var opts = nomnom.parse();


var kb = new KubernetesClient();
// kb.services.all().then(function() {
//     console.log("ping'd!");
// });
