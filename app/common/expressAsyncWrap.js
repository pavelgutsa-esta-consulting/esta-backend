// catches error from async-await middleware and calls `next` middleware
module.exports = function (middleware) {
  return (...args) => middleware(...args).catch(args[2]);
};
