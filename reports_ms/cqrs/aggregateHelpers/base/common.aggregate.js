const fs = require("fs");
const CONSTANTS = require("../../../constants");

const CommonAggregateHandler = {
  // List of aggregate handler instances
  aggregateHandlerList: {},

  // save aggregate handler instances
  initialzeAggregateHandlers() {
    // scan all files in the aggregate helpers directory
    fs.readdir(`/usr/src/app/cqrs/aggregateHelpers/child`, (err, files) => {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        // get aggregate names from each file
        const handler = require(`/usr/src/app/cqrs/aggregateHelpers/child/${files[fileIndex]}`);
        let aggregateHandler = new handler();
        let aggregates = aggregateHandler.getAggregates();

        // save the aggregate handler with the aggregate name
        aggregates.forEach(aggregateName => {
          this.aggregateHandlerList[aggregateName] = aggregateHandler;
        });
      }
    });
  },

  // gets aggregate handler of corresponding aggregate name
  getAggregateHandler(aggregateName) {
    try {
      // extract the aggregate handler from aggregateHandlerList using the aggregate name
      let aggregateHandler = this.aggregateHandlerList[aggregateName];
      if (!aggregateHandler)
        return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
      return Promise.resolve(aggregateHandler);
    } catch (e) {
      // reject if aggregate name not found
      return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
    }
  }
};

console.log(
  "[COMMON AGGREGATE HANDLER] Initializing Common Aggregate Handlers"
);
CommonAggregateHandler.initialzeAggregateHandlers();

// push aggregate and id to aggregate queue
function getCurrentState(aggregateName, aggregateID) {
  let aggregateHandler =
    CommonAggregateHandler.aggregateHandlerList[aggregateName];
  return Promise.resolve(
    aggregateHandler.getCurrentState(aggregateID).then(aggregate => {
      // aggregate built, return back
      return aggregate;
    })
  );
}

module.exports = {
  getCurrentState: getCurrentState
};
