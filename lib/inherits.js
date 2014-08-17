/** A slightly better inherits, that copies any fields (ie., class
  * methods) as well as sets up the prototypes.  A combination of
  * node's utils.inherits and CoffeeScript's extends boilerplate.
  */
var inherits = function(ctor, superCtor) {
    // this is cribbed from node's util.inherits().
    if(!(superCtor instanceof Function)) {
        throw new Error("You must specify a constructor function as the super constructor.");
    }
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    var hasOwnProp = {}.hasOwnProperty;

    // copy any class scope items (class methods and such). sort of
    // cribbed from coffeescript's boilerplate.  However, unlike
    // CoffeeScript, I do not overwrite items alrady present in ctor.
    for (var key in superCtor) {
        if (!hasOwnProp.call(ctor, key) && hasOwnProp.call(superCtor, key)) {
            ctor[key] = superCtor[key];
        }
    }
    return ctor;
};

module.exports = inherits;
