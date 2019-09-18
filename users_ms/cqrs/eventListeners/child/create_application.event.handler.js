const queryHandler = require("../../../db/sql/users/applications.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function ApplicationApprovedEventHandler() {}

ApplicationApprovedEventHandler.prototype = Object.create(
  BaseEventHandler.prototype
);

Object.defineProperty(
  ApplicationApprovedEventHandler.prototype,
  "constructor",
  {
    value: ApplicationApprovedEventHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

ApplicationApprovedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_APPLICATION_CREATED];
};

ApplicationApprovedEventHandler.prototype.performEvent = function(
  event,
  offset
) {
  console.log("[ACTUAL EVENT HANDLER] event received: application created");
  queryHandler.createApplication(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = ApplicationApprovedEventHandler;
