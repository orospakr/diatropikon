var winston = require('winston');

// inject logger into the global namespace (I know, I know...).  I'm
// going to eventually switch to some sort of DI solution (maybe
// Angular 2.0's DI once it stabilises), and I want it in the global
// namespace for the DSL anyway...
var l = new winston.Logger({
    transports: [
        new (winston.transports.Console)({level: process.env.DEBUG ? "debug" : "info"})
    ]
});

// TODO: somehow, for testing, add buffering and silencing log output
// while running tests, and only barfing it out for failed tests.  I
// think nosetests has something like this.  Sadly, probably a pain to
// make work.

global.logger = l;


l.cli();

module.exports = l;
