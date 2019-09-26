const fs = require("fs");
const CONSTANTS = require("../../../constants");
const async = require("async");

function CommonEventHandler(broker, CommonCommandHandler) {
  const handler = {
    // List of event handler instances
    eventHandlerList: {},

    eventQueue: async.queue(function(task, callback) {
      console.log(
        `[COMMON EVENT HANDLER] Performing event ${task.event.eventName}`
      );
      handler
        .sendEvent(task.event, task.offset)
        .then(commands => {
          // if there are additional commands, send them to common command handler
          commands.forEach(command => {
            console.log(
              "[COMMON EVENT HANDLER] Sending",
              command.commandName,
              "to Command Handler"
            );
            let commandName = command.commandName;
            let payload = command.payload;
            CommonCommandHandler.sendCommand(payload, commandName);
          });
          callback();
        })
        .catch(() => {});
    }),

    // save event handler instances
    initialzeEventHandlers() {
      // scan all files in the event handlers directory
      let files = fs.readdirSync(`${process.cwd()}/cqrs/eventListeners/child`);
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        // get events names from each file
        const handler = require(`${process.cwd()}/cqrs/eventListeners/child/${
          files[fileIndex]
        }`);
        let eventHandler = new handler();
        let events = eventHandler.getEvents();

        // save the event handler with the event name
        events.forEach(event => {
          this.eventHandlerList[event] = eventHandler;
        });
      }

      broker.eventSubscribe((event, offset) => {
        return handler.enqueueEvent(event, offset);
      });

      broker.aggregateSubscribe(event => {
        console.log(
          "[COMMON EVENT HANDLER] Event received from User Microservice"
        );

        return handler.enqueueEvent(event, 0); // 0 offset because it's not really needed (can be omitted)
      });
    },

    // send to actual event handlers
    sendEvent(event, offset) {
      // get appropriate event handler
      return this.getEventHandler(event.eventName).then(eventHandler => {
        // run perform
        if (eventHandler) return eventHandler.performEvent(event, offset);
        else return Promise.resolve([]);
      });
    },

    // get event handler with corresponding event name
    getEventHandler(eventName) {
      try {
        // extract the event handler from eventHandlerList using the event name
        let eventHandler = this.eventHandlerList[eventName];
        return Promise.resolve(eventHandler);
      } catch (e) {
        // reject if event name not found
        return Promise.reject(CONSTANTS.ERRORS.EVENT_NOT_EXISTS);
      }
    },

    enqueueEvent(event, offset) {
      return Promise.resolve(
        this.eventQueue.push(
          { event: event, offset: offset },
          // perform event
          function() {
            console.log("[COMMON EVENT HANDLER] Event done");
          }
        )
      );
    }
  };

  console.log("[COMMON EVENT HANDLER] Initializing Common Event Handler");
  handler.initialzeEventHandlers();
  return handler;
}

module.exports = CommonEventHandler;
