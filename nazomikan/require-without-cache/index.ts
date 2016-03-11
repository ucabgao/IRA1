/**
 * require module without cache
 *
 * @param {String} path [module path]
 * @param {Function} require [module.require or compatible custom require]
 */

declare class CBRequire {
 	cache: number;
	resolve(foo: string): any;
}



module.exports = function (path: string, require:CBRequire) {


var cache: number
    , module
    ;

  path = require.resolve(path);

  // save cache
  cache = require.cache[path];
  delete require.cache[path];
  module = require(path);

  var x = cache[4];

  // restore cache
  require.cache[path] = cache[path];

  return module;
};
