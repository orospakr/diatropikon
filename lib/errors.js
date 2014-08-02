var util = require("util");

/** Use this for errors that are "expected" failure conditions, and
 * should not trigger a backtrace and crash.
*/
function DiatropikonError(message, reason) {
    this.reason = reason;
    Error.call(this, message);
}
util.inherits(DiatropikonError, Error);

function KubernetesError(message, reason) {
}
util.inherits(KubernetesError, DiatropikonError);

module.exports = {
    DiatropikonError: DiatropikonError,
    KubernetesError: KubernetesError
};
