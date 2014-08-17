/**
   DSL context object used to construct resources.  Resource classes
   can set their Builder by adding Builder function.  However, do not
   set the prototype/inherits manually.  registerSubtype() on Resource
   will take care of that for you.
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
