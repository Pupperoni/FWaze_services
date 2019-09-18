const queryHandler = require("../../../db/sql/users/applications.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function ApplicationRejectedEventHandler() {}

ApplicationRejectedEventHandler.prototype = Object.create(
  BaseEventHandler.prototype
);

Object.defineProperty(
  ApplicationRejectedEventHandler.prototype,
  "constructor",
  {
    value: ApplicationRejectedEventHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

ApplicationRejectedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_APPLICATION_REJECTED];
};

ApplicationRejectedEventHandler.prototype.performEvent = function(
  event,
  offset
) {
  console.log("[ACTUAL EVENT HANDLER] event received: application rejected");
  queryHandler.rejectApplication(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = ApplicationRejectedEventHandler;
