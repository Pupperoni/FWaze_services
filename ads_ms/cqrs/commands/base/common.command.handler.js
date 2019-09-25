const fs = require("fs");
const CONSTANTS = require("../../../constants");
const async = require("async");

function CommonCommandHandler(writeRepo, broker, CommonAggregate) {
  const handler = {
    // List of command handler instances
    commandHandlerList: {},

    commandQueue: async.queue(function(task, callback) {
      console.log(`[COMMON COMMAND HANDLER] Running ${task.commandName}`);
      let commandHandler = handler.commandHandlerList[task.commandName];
      commandHandler.performCommand(task.payload).then(events => {
        // after the events, send to read and write models
        events.forEach(event => {
          handler.addEvent(event);
        });
      });
      callback();
    }),

    // save command handler instances
    initialzeCommandHandlers() {
      // scan all files in the commands directory
      fs.readdir(`${process.cwd()}/cqrs/commands/child`, (err, files) => {
        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
          // get command names from each file
          const handler = require(`${process.cwd()}/cqrs/commands/child/${
            files[fileIndex]
          }`);
          let commandHandler = new handler(CommonAggregate);
          let commands = commandHandler.getCommands();

          // save the command handler with the command name
          commands.forEach(command => {
            this.commandHandlerList[command] = commandHandler;
          });
        }
      });

      // Wait for messages
      broker.commandSubscribe(message => {
        let deserialized = JSON.parse(message.value);
        let payload = deserialized.payload;
        let commandName = deserialized.commandName;
        return handler.enqueueCommand(commandName, payload);
      });
    },

    // send command to actual command handlers
    sendCommand(payload, commandName) {
      // get appropriate command handler
      return this.getCommandHandler(commandName).then(commandHandler => {
        // run the functions
        return commandHandler
          .validate(payload)
          .then(valid => {
            // Publish command and payload to kafka
            console.log(
              `[COMMON COMMAND HANDLER] Sending command ${commandName} to broker`
            );
            let formattedPayload = {
              payload: payload,
              commandName: commandName
            };
            let aggregateID = payload.aggregateID;
            broker.publish(
              CONSTANTS.TOPICS.AD_COMMAND,
              formattedPayload,
              aggregateID
            );
            return payload;
          })
          .catch(e => {
            return Promise.reject(e);
          });
      });
    },

    // gets command handler of corresponding command name
    getCommandHandler(commandName) {
      try {
        // extract the command handler from commandHandlerList using the command name
        let commandHandler = this.commandHandlerList[commandName];
        if (!commandHandler)
          return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
        return Promise.resolve(commandHandler);
      } catch (e) {
        // reject if command name not found
        return Promise.reject(CONSTANTS.ERRORS.COMMAND_NOT_EXISTS);
      }
    },

    // send event to read repo
    sendEvent(event, offset) {
      let aggregateID = event.aggregateID;
      broker.publish(CONSTANTS.TOPICS.AD_EVENT, event, aggregateID, offset);
      broker.publish(CONSTANTS.TOPICS.PUSH_EVENT, event, aggregateID, offset);
    },

    // add event to write repo
    addEvent(event) {
      // call write repo to save to event store
      writeRepo.enqueueEvent(event, function(offset) {
        handler.sendEvent(event, offset);
      });
    },
    // push command and payload to command queue
    enqueueCommand(commandName, payload) {
      return Promise.resolve(
        this.commandQueue.push(
          {
            commandName: commandName,
            payload: payload
          },
          // perform command
          function() {
            console.log("[COMMON COMMAND HANDLER] Command executed");
          }
        )
      );
    }
  };

  console.log("[COMMON COMMAND HANDLER] Initializing Common Command Handler");
  handler.initialzeCommandHandlers();
  return handler;
}

module.exports = CommonCommandHandler;
