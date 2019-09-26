const fs = require("fs");
const CONSTANTS = require("../../../constants");
const async = require("async");

function CommonBoundedContextHandler(broker, writeRepo) {
  const handler = {
    // List of bounded context handler instances
    boundedContextHandlerList: {},

    bcQueue: async.queue(function(task, callback) {
      let boundedContextHandler =
        handler.boundedContextHandlerList[task.event.aggregateName];
      boundedContextHandler.performCopy(task.event).then(() => {
        // after the events, send to read and write models
        console.log("[COMMON BOUNDED CONTEXT HANDLER] Event saved");
      });
      callback();
    }),

    // save bounded context handler instances
    initialzeBoundedContextHandlers() {
      // scan all files in the boundedContext directory
      let files = fs.readdirSync(`${process.cwd()}/cqrs/boundedContext/child`);
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        // get aggregate names from each file
        const handler = require(`${process.cwd()}/cqrs/boundedContext/child/${
          files[fileIndex]
        }`);
        let boundedContextHandler = new handler(writeRepo);
        let aggregates = boundedContextHandler.getAggregates();

        // save the handler with the aggregate name
        aggregates.forEach(aggregate => {
          this.boundedContextHandlerList[aggregate] = boundedContextHandler;
        });
      }
      broker.aggregateSubscribe(event => {
        console.log(
          "[COMMON BOUNDED CONTEXT HANDLER] Message received from User Microservice"
        );

        return handler.enqueueEvent(event);
      });
    },

    // gets bounded context handler of corresponding aggregate name
    getBoundedContextHandler(aggregateName) {
      try {
        // extract the handler from boundedContextHandlerList using the aggregate name
        let boundedContextHandler = this.boundedContextHandlerList[
          aggregateName
        ];
        if (!boundedContextHandler)
          return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
        return Promise.resolve(boundedContextHandler);
      } catch (e) {
        // reject if aggregate name not found
        return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
      }
    },
    // push event to bc queue
    enqueueEvent(event) {
      return Promise.resolve(
        this.bcQueue.push({ event: event }, function() {})
      );
    }
  };
  console.log(
    "[COMMON BOUNDED CONTEXT HANDLER] Initializing Common Bounded Context Handler"
  );
  handler.initialzeBoundedContextHandlers();
  return handler;
}

module.exports = CommonBoundedContextHandler;
