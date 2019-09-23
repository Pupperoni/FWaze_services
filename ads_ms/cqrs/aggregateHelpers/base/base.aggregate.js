function BaseAggregateHandler(eventStoreHelper) {
  this.eventStoreHelper = eventStoreHelper;
}

BaseAggregateHandler.prototype.getAggregates = function() {
  return [];
};

BaseAggregateHandler.prototype.getCurrentState = function(aggregateID) {
  return Promise.resolve();
};

module.exports = BaseAggregateHandler;
