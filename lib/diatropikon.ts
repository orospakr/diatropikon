// Main control plane.

var Promise = require("bluebird");
Promise.longStackTraces();

var KubernetesClient = require("./kubernetes-rest.js");

var chalk = require("chalk");

var cmdln = require("cmdln");

var util = require("util");

var logger = require("./logger");

var Project = require("./project");
var Resource = require("./resource");
var Diafile = require("./diafile");

var Errors = require("./errors");
var DiatropikonError = Errors.DiatropikonError;
var KubernetesError = Errors.KubernetesError;

// import Operation = require("./operation");

logger.debug("Starting Diatropikon...")

export class Diatropikon {
  
  operations: Operation[]
  
  project: any // TODO will be Diafile
  
  project_directory: String
  
  environmentName() {
     return (process.env.DIA_ENV || "local").toLowerCase();
  }
  
  start() {
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
        var deploy = require("./commands/deploy");
        schedule_operation(new deploy.Deploy());
        logger.debug("yay");
        callback();
    };
    DiaCommandLine.prototype.do_deploy.help = "Ensure all resources in the Kubernetes cluster are up to date.";

    DiaCommandLine.prototype.do_status = function(subcmd, opts, args, callback) {
        var status = require("./commands/status");
        schedule_operation(new status.Status());
        callback();
    };
    DiaCommandLine.prototype.do_status.help = "Check the state of the cluster.";

    DiaCommandLine.prototype.do_build = function(subcmd, opts, args, callback) {
        var build = require("./commands/build");
        schedule_operation(new build.Build());
        callback();
    };
    DiaCommandLine.prototype.do_build.help = "Check the state of the cluster.";

    logger.debug("Parsing command line...");
    var cli = new DiaCommandLine();
    // we never emit an unhandled exception unless something is broken.
    cli.showErrStack = true;
    
    // HACK: break cmdln's behaviour of using process.exit:
    // waiting on https://github.com/trentm/node-cmdln/issues/11
    var actualExit = process.exit;
    process.exit = function() { };
    cmdln.main(cli);
    process.exit = actualExit;

    // now, set the defaults for the options:
    this.project_directory =  this.project_directory || process.cwd();

    var kube;

    logger.debug('sdfsadf');
    Resource.walkAndLoadAll().then(function() {
      logger.debug("walked?!");
        return Diafile.search(self, self.project_directory);
    }).then(function(diafile) {
        return diafile.load();
    }).then(function(project) {
        logger.debug("Diafile loaded!");
        self.project = project;
        return project;
    }).then(function(project) {
        // now try reaching out to the Kubernetes indicated by the
        // env:
        kube = new KubernetesClient(project.env.getApiserver());
        // TODO return kube.ping();
        return null;
    }).then(function() {
      logger.debug("Diatropikon ready.");
        return true;
    }).catch(KubernetesError, function(err) {
        logger.error("Problem contacting Kubernetes: is your cluster running?", err.toString());
        return false;
    }).catch(DiatropikonError, function(err) {
        
        logger.error(err.toString());
    }).then(function(ready) {
      if(ready) {
        logger.debug("Now, going to execute operations...");
        return Promise.all(self.operations.map(function(op: Operation) {
          return op.execute(self.project, kube);
        }));;
      }
    }).catch(DiatropikonError, function(err) {
        logger.error("Problem running command.", err.toString());
    }).catch(function(e) {
        logger.error(e.toString(), e.stack);
    });
  }
}


// var d = new Diatropikon();

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


// var kb = new KubernetesClient();
// kb.services.all().then(function() {
//     console.log("ping'd!");
// });

new Diatropikon().start();
