// Helpers meant to be injected globally, for the benefit of Diafile.
function Helpers() {
}

Helpers.prototype.diatropikon = function(version) {
}

Helpers.poison = function(target) {
    // copy all of my members into the target object.  Used to poison
    // the global namespace.

    for(k in Helpers.prototype) {
        if (Helpers.prototype.hasOwnProperty(k)) {
            target[k] = Helpers.prototype[k].bind(target);
        }
        
    }
}

module.exports = Helpers;
