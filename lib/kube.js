var KubernetesClient = require("./kubernetes-rest.js");

var kb = new KubernetesClient();
kb.services.all().then(function() {
    console.log("ping'd!");
});
