# Diatropikon

Devops ergonomics for [Kubernetes](http://kubernetes.io).  Capture and
define your cloud infrastructure as a Kubernetes-powered ops pipeline
in code.

*(Note; this project is still in progress: much of the below README is
serving as a design document in the meantime)*

* Define your Kubernetes cluster in code (with your option of a shiny
  CoffeeScript DSL, flat JSON, or YAML) and build your Docker
  containers, or libraries of Kubernetes components for use in multiple
  clusters.
* Build and run your infrastructure on developer laptops, multiple
  cloud platforms, and in multiple environments.
* Treat infrastructure changes to the same peer code review process as the
  rest of your code.
* Leverage the growing Docker and Kubernetes ecosystems.
* Low-impedance addition of new microservices to your cloud, but not
  at the expense of visibility.


Task board: https://trello.com/b/Q0I6vxg1/diatropikon

Copyright (C) 2014-2015 Andrew Clunis.  License is MIT. See
[LICENSE](./LICENSE).

## First Principles

Define your Docker containers, Kubernetes pods, services, and
replication controllers as files, and Diatropikon will sync them into
your Kubernetes cluster for you.

TODO

* The four Kubernetes data types (and their nesting!)
* the scope of Diatropikon
* Dia's method of scoping the definitions of the above types
* Storage and Volume types!

## Usage


To install Diatropikon globally, in order to get access to the tool in
order to bootrap a new project (alternatively, you could use a
checkout of this project as per the Development section below and add
its bin directory to your path temporarily) and:

    $ npm install -g diatropikon

This will install the `dt` command, which you can use to interact with
your Diatropikon-powered Kubernetes projects.

Create your project (it is not recommended that you add Diatropikon to
an existing project directory; it should be in its own repository or
at least its own directory):

    $ dt init mystack (TODO)
    $ cd mystack
    $ git init && git add .

Generate some containers:

    $ dt generate container minecraft_server
    $ dt generate container minecraft_overviewer

This will generate both a Kubernetes container definitions, along with
fresh Dockerfile projects to go alongside.

(specify `--type` to `generate` to make it generate `json`, `yaml`, or
`javascript`, `javascript` DSL, `coffee` DSL, or `litcoffee` for
Literate CoffeeScript DSL).

Now, generate a [pod] (TODO hyperlink to Kubernetes docs):

    $ dt generate pod minecraft minecraft_server,minecraft_overviewer

    $ dt generate service minecraft minecraft -p 25565

For commands that interact with a cluster, it'll honour the
environment variable `DIA_ENV` for selecting which environment (that
is, configured cluster) you want to interact with.  However, it'll
default to `local`.

    $ dt build # get all the containers built, out in current env
    $ dt status: show details about current environment, how many of each item, what’s out of date
    $ dt deploy —dry # tells you what it’s going to update/create
    $ dt deploy # do it!
    $ dt deploy $label (redeploy all things matching this label)
    $ dt deploy (redeploy all the things.  support -u, too, for specifying rolling update times)
    $ dt select $label (—live to query the running environment)
    $ dt graph # get a graphviz dot of all services and their relationships. `—live` includes currentState details (replicator counts, etc.) from current environment.

So, directory structure (items in parens are example names):

```
.
├─ Diafile
├─ package.json
├─ images
├─ containers
├─ pods
├─ services
│  ├─ (nginx.coffee)           - you can define an entire service (and dependencies)
│  │                             inside a single file, as has been done here for the
│  │                             nginx service...
│  ├─ (minecraft)              - or, you can fragment them into their own directory
│  │                             structure.
│  │  ├─ service.coffee        - however, since you need to still define the base
│  │                             type's directory, so add it here, as
│  │                             <type_name>.coffee.
│  │  ├─ containers
└─ replicators
```

### Workflows

TODO.  Commonest developer user stories.

## Development

Install the local dependencies:

    $ npm install

And fetch down the third-party TypeScript type mappings with DTSM:

    $ ./node_modules/dtsm/bin/dtsm install

And then run the TypeScript build:

    $ ./node_modules/typescript/bin/tsc

Then, bring up the included Vagrant VM that contains CoreOS and
Kubernetes in order to test against:

    $ vagrant up

    # then, port forward the Kubernetes API server locally:
    $ vagrant ssh -- -L8080:localhost:8080

Now you can run Diatropikon directly in its repo, against a bundled
example project:

    $ DEBUG=1 DIA_ENV=local ./bin/dt -d example deploy

## FAQ

1. What is the rationale for JavaScript over Golang/Ruby/Haskell/.net?

Golang is an awesome language, but since this project's goal is to
allow developers to fluidly manage their ops code, with easy access to
a turing complete DSL, a compiled language like Go (particularly its
lack of dynamic loading) bears too much impedance.  Moreover, I found
that Node struck a decent balance between being easier for user
onboarding (installation ease and repeatability), friendliness for the
various major stakeholders in the Kubernetes ecosystem, while still
being decent for developing with.

2. 20 megs of dependencies?!

Yeah, I know. Node.js' method of nesting dependencies means that many
dependencies get expanded into the `node_modules` directory multiple
times.  Sorry.

3. What encoding should project files be written in?

Everything is read as UTF-8.
