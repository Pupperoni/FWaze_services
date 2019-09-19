const fs = require("fs");
const CommonCommandHandler = require("../../commands/base/common.command.handler");
const CONSTANTS = require("../../../constants");
const async = require("async");
const broker = require("../../../kafka");

const CommonEventHandler = {
  // List of event handler instances
  eventHandlerList: {},

  eventQueue: async.queue(function(task, callback) {
    console.log(
      `[COMMON EVENT HANDLER] Performing event ${task.event.eventName}`
    );
    CommonEventHandler.sendEvent(task.event, task.offset)
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
    fs.readdir(`/usr/src/app/cqrs/eventListeners/child`, (err, files) => {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        // get events names from each file
        const handler = require(`/usr/src/app/cqrs/eventListeners/child/${files[fileIndex]}`);
        let eventHandler = new handler();
        let events = eventHandler.getEvents();

        // save the event handler with the event name
        events.forEach(event => {
          this.eventHandlerList[event] = eventHandler;
        });
      }
    });
  },

  // send to actual event handlers
  sendEvent(event, offset) {
    // get appropriate event handler
    return this.getEventHandler(event.eventName)
      .then(eventHandler => {
        // run perform
        return eventHandler.performEvent(event, offset);
      })
      .catch(console.log);
  },

  // get event handler with corresponding event name
  getEventHandler(eventName) {
    try {
      // extract the event handler from eventHandlerList using the event name
      let eventHandler = this.eventHandlerList[eventName];
      if (!eventHandler)
        return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);

      return Promise.resolve(eventHandler);
    } catch (e) {
      // reject if event name not found
      return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
    }
  }
};

console.log("[COMMON EVENT HANDLER] Initializing Common Event Handler");
CommonEventHandler.initialzeEventHandlers();

function enqueueEvent(event, offset) {
  return Promise.resolve(
    CommonEventHandler.eventQueue.push(
      { event: event, offset: offset },
      // perform event
      function() {
        console.log("[COMMON EVENT HANDLER] Event done");
      }
    )
  );
}

broker.eventSubscribe((event, offset) => {
  return enqueueEvent(event, offset);
});

broker.aggregateSubscribe(event => {
  console.log("[COMMON EVENT HANDLER] Event received from User Microservice");
  // update user name
  if (event.eventName === CONSTANTS.EVENTS.USER_UPDATED) {
    // if exists in the payload
    if (event.payload.name) {
      return enqueueEvent(event, 0); // 0 offset because it's not really needed (can be omitted)
    }
  }
  return Promise.resolve();
});

module.exports = CommonEventHandler;
