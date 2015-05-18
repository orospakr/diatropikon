var util = require("util")
var Environment = require("../environment")

/**
 * Support for Google Cloud's Container Engine.
 */
function Gcloud(type, filename, contents) {
}

Gcloud.Builder = function() {
    Gcloud.Builder.super_.apply(this, arguments);
};

Environment.registerSubtype(Gcloud, "Gcloud");

module.exports = Gcloud;
