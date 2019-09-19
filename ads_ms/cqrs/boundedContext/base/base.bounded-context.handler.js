const CONSTANTS = require("../../../constants");

function BaseBoundedContextHandler() {}

BaseBoundedContextHandler.prototype.getAggregates = function() {
  return [];
};

BaseBoundedContextHandler.prototype.performCopy = function(event) {
  return Promise.resolve();
};

module.exports = BaseBoundedContextHandler;
