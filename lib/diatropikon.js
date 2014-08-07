'use strict';

var Promise = require("bluebird");
Promise.longStackTraces();

var KubernetesClient = require("./kubernetes-rest.js");

var chalk = require("chalk");

var cmdln = require("cmdln");

var util = require("util");

var winston = require('winston');

var Project = require("./project");
var Diafile = require("./diafile");

var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;
var KubernetesError = Errors.KubernetesError;

// inject logger into the global namespace (I know, I know...).  I'm
// going to eventually switch to some sort of DI solution (maybe
// Angular 2.0's DI once it stabilises), and I want it in the global
// namespace for the Diafile anyway...
global.logger = winston;
var logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({level: process.env.DEBUG ? "debug" : "info"})
    ]
});

global.logger = logger;


logger.cli();
logger.debug("Starting Diatropikon...")

function Diatropikon() {
    var self = this;

    self.operations = []

    function schedule_operation(op) {
        self.operations.push(op);
    }

    function DiaCommandLine() {
        cmdln.Cmdln.call(this, {
            name: "dt",
            desc: "Devops ergonomics for Kubernetes.",
            options: [
                {
                    names: ['help', 'h'],
                    help: 'Show this help message and exit.',
                    type: 'bool'
                },
                {
                    names: ["directory", "d"],
                    type: 'string',
                    helpArg: "DIR",
                    help: "Specify your project directory (ie, contains the Diafile)"
                }
            ]
        });
    };
    util.inherits(DiaCommandLine, cmdln.Cmdln);

    DiaCommandLine.prototype.init = function(opts, args, callback) {
        if(opts["directory"] !== undefined) {
            // user specified directory!
            self.project_directory = opts["directory"];
            
        }
        return cmdln.Cmdln.prototype.init.call(this, opts, args, callback);
    }

    function GenerateCommand() {
        cmdln.Cmdln.call(this, {
            name: "dt generate",
            desc: "Generate new resources."
        });
    };
    util.inherits(GenerateCommand, cmdln.Cmdln);

    // TODO: generate all of the generate subcommands programmatically
    // from our generators, and then have the callbacks create
    // Operations.
    GenerateCommand.prototype.do_pod = function(subcmd, opts, args, callback) {
        callback();
    };

    DiaCommandLine.prototype.do_generate = function(subcmd, opts, args, callback) {
        // HACK: in order to fool Cmdln into nesting itself, add two dummy
        // entries to the array.
        cmdln.main(GenerateCommand, ["_", "_"].concat(args));
        callback();
    };
    DiaCommandLine.prototype.do_generate.help = "Generate new resources.";

    DiaCommandLine.prototype.do_deploy = function(subcmd, opts, args, callback) {
        var Deploy = require("./commands/deploy");
        schedule_operation(new Deploy());
        callback();
    };
    DiaCommandLine.prototype.do_deploy.help = "Ensure all resources in the Kubernetes cluster are up to date.";

    DiaCommandLine.prototype.do_status = function(subcmd, opts, args, callback) {
        var Status = require("./commands/status");
        schedule_operation(new Status());
        callback();
    };
    DiaCommandLine.prototype.do_status.help = "Check the state of the cluster.";

    DiaCommandLine.prototype.do_build = function(subcmd, opts, args, callback) {
        var Build = require("./commands/build");
        schedule_operation(new Build());
        callback();
    };
    DiaCommandLine.prototype.do_build.help = "Check the state of the cluster.";


    cmdln.main(DiaCommandLine);

    // now, set the defaults for the options:
    this.project_directory =  this.project_directory || process.cwd();

    var kube;


    Diafile.search(self, self.project_directory).then(function(diafile) {
        return diafile.load();
    }).then(function(project) {

        self.project = project;
        return project;
    }).then(function(project) {
        // now try reaching out to the Kubernetes indicated by the
        // env:
        kube = new KubernetesClient(project.env.getApiserver());
        //return kube.ping();
        return null;
    }).then(function() {
        return true;
    }).catch(KubernetesError, function(err) {
        logger.error("Problem contacting Kubernetes: is your cluster running?", err.toString());
        return false;
    }).catch(DiatropikonError, function(err) {
        logger.error(err.toString());
    }).then(function(ready) {
        if(ready) {
            logger.debug("Now, going to execute operations...");
            // TODO: promise all

            return Promise.all(self.operations.map(function(op) {
                return op.execute(self.project, kube);
            }));;
        }
    }).catch(DiatropikonError, function(err) {
        logger.error("Problem running command.", err.toString());
    });
}

Diatropikon.prototype.environmentName = function() {
    return process.env.DIA_ENV || "local";
}

var d = new Diatropikon();

// var nomnom = require("nomnom");

// nomnom.command('init')
//     .help("Initialize a new Kube project")
//     .options({
//               'directory': {position: 0, required: true, help: "Create new Kube project in the specified directory"}})
//     .callback(function(opts) {
//         // user called init!
//         console.log("init!");
//     });

// nomnom.command('generate')
//     .help("Generate a definition of a new Kubernetes resource")
//     // TODO crap, commands are not nestable. a single positional
//     // argument seems to do the trick, but I want to be able to put
//     // separate options inside each, all discoverable with `kube
//     // generate pod --help`, for instance.
//     .options({
//         "type": {position: 0, required: true, help: "Specify type of resource to be generated"}
//     });

// nomnom.command('up')
//     .help("Start up or provision the hosting environment, idempotently");

// nomnom.command('build')
//     .help("Build (or fetch) all of the Docker container images in the current environment");

// nomnom.command('deploy')
//     .help("Sync all container/pod/service/replicator definitions into your Kubernetes cloud, idempotently")
//     .options({
//         "dry": {help: "Do not modify any state, merely show what would be done"}
//     });

// nomnom.command('status')
//     .help("Show what's up to date in the current environment");


// var opts = nomnom.parse();


var kb = new KubernetesClient();
// kb.services.all().then(function() {
//     console.log("ping'd!");
// });
