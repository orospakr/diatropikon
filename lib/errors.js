var util = require("util");

/** Use this for errors that are "expected" failure conditions, and
 * should not trigger a backtrace and crash.
*/
function DiatropikonError(message, reason) {
    var self = new Error
    this.reason = reason;

    // so, this is misleading. Error(), by historical artifact, is
    // actually returning a new error object, and not obeying the
    // 'this' binding.  however, lots of blog posts and such seem to
    // suggest that manually copying the important fields into your
    // actual this.
    var e = Error.call(this, message);
    this.message = message;
    this.stack = e.stack;
}
util.inherits(DiatropikonError, Error);

DiatropikonError.prototype.toString = function() {
    var reasonMessage = this.reason === undefined ? "" : ": " + this.reason.toString();
    return Error.prototype.toString.call(this) + reasonMessage;
}

function KubernetesError(message, reason) {
    DiatropikonError.call(this, message, reason);
}
util.inherits(KubernetesError, DiatropikonError);

module.exports = {
    DiatropikonError: DiatropikonError,
    KubernetesError: KubernetesError
};
