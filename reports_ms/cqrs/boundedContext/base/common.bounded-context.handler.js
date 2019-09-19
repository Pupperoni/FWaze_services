const fs = require("fs");
const CONSTANTS = require("../../../constants");
const async = require("async");
const broker = require("../../../kafka");

const CommonBoundedContextHandler = {
  // List of bounded context handler instances
  boundedContextHandlerList: {},

  bcQueue: async.queue(function(task, callback) {
    let boundedContextHandler =
      CommonBoundedContextHandler.boundedContextHandlerList[
        task.event.aggregateName
      ];
    boundedContextHandler.performCopy(task.event).then(() => {
      // after the events, send to read and write models
      console.log("[COMMON BOUNDED CONTEXT HANDLER] Event saved");
    });
    callback();
  }),

  // save bounded context handler instances
  initialzeBoundedContextHandlers() {
    // scan all files in the boundedContext directory
    fs.readdir(`/usr/src/app/cqrs/boundedContext/child`, (err, files) => {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        // get aggregate names from each file
        const handler = require(`/usr/src/app/cqrs/boundedContext/child/${files[fileIndex]}`);
        let boundedContextHandler = new handler();
        let aggregates = boundedContextHandler.getAggregates();

        // save the handler with the aggregate name
        aggregates.forEach(aggregate => {
          this.boundedContextHandlerList[aggregate] = boundedContextHandler;
        });
      }
    });
  },

  // gets bounded context handler of corresponding aggregate name
  getBoundedContextHandler(aggregateName) {
    try {
      // extract the handler from boundedContextHandlerList using the aggregate name
      let boundedContextHandler = this.boundedContextHandlerList[aggregateName];
      if (!boundedContextHandler)
        return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
      return Promise.resolve(boundedContextHandler);
    } catch (e) {
      // reject if aggregate name not found
      return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
    }
  }
};

// push event to bc queue
function enqueueEvent(event) {
  return Promise.resolve(
    CommonBoundedContextHandler.bcQueue.push({ event: event }, function() {})
  );
}

broker.aggregateSubscribe(event => {
  console.log(
    "[COMMON BOUNDED CONTEXT HANDLER] Message received from User Microservice"
  );

  return enqueueEvent(event);
});

console.log(
  "[COMMON BOUNDED CONTEXT HANDLER] Initializing Common Bounded Context Handler"
);
CommonBoundedContextHandler.initialzeBoundedContextHandlers();

module.exports = CommonBoundedContextHandler;
