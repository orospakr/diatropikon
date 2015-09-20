// Operation base class.
var util = require("util");

interface Operation {
    execute(project, kube);
}
