/**
 * require module without cache
 *
 * @param {String} path [module path]
 * @param {Function} require [module.require or compatible custom require]
 */

 interface r {
(x:string):any 
resolve(x:string):string;
cache:Array<string>;
}

//module.exports = function (path:string, require:r) {
function f (path:string, require:r) {

  var cache:string
    , module
    ;

  path = require.resolve(path);

  // save cache
  cache = require.cache[path];
  delete require.cache[path];
  module = require(path);

  // restore cache
  require.cache[path] = cache[path];

  return module;
};
