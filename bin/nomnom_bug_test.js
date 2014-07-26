#!/usr/bin/env node

var nomnom = require("nomnom");

nomnom.command("go")
    .help("Do a thing")
    .options({
        "important": {position: 0, required: true, help: "I'm required!"}
    });

nomnom.parse();
