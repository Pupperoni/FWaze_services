function BaseBoundedContextHandler(writeRepo) {
  this.writeRepo = writeRepo;
}

BaseBoundedContextHandler.prototype.getAggregates = function() {
  return [];
};

BaseBoundedContextHandler.prototype.performCopy = function(event) {
  return Promise.resolve();
};

module.exports = BaseBoundedContextHandler;
