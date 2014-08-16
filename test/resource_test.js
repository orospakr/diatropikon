var chai = require("chai");
var Promise = require("bluebird");
require("../lib/logger");

var Resource = require("../lib/resource");

describe("Resource", function() {
    it("should be awesome", function() {
        var contents = JSON.stringify({
            "myvalue": 56
        });

        return Resource.load("json", "myresource.json", contents);
    });
});
