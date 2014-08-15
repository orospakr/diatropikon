/**
   DSL context object used to construct resources.
 */
function ResourceBuilder(target) {
    this.target = target;
}


/**
   This is so DSL code can set values we didn't think of, at least for
   now.
 */
ResourceBuilder.prototype.set_value = function(k, v) {
    logger.debug("SETTING", k, v, "ON", this);
    this.target[k] = v;
    return this.target;
}

module.exports = ResourceBuilder;
