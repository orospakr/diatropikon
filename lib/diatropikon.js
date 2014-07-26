'use strict';

var KubernetesClient = require("./kubernetes-rest.js");

var chalk = require("chalk");

var cmdln = require("cmdln");

var util = require("util");

var Diafile = require("./diafile");

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

    DiaCommandLine.prototype.do_deploy = function(subcmd, opts, args, callback) {
        var Deploy = require("./commands/deploy");
        schedule_operation(new Deploy(self));
        callback();
    };
    DiaCommandLine.prototype.do_deploy.help = "Ensure all resources in the Kubernetes cluster are up to date.";

    DiaCommandLine.prototype.do_generate.help = "Generate new resources.";
    
    cmdln.main(DiaCommandLine);

    // now, set the defaults for the options:
    this.project_directory =  this.project_directory || process.cwd();

    // TODO: then, run the Operations

    self.diafile = new Diafile(self);

    self.operations.forEach(function(op) {
        op.execute(self);
    });
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
