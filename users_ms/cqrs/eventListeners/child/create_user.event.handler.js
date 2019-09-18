const queryHandler = require("../../../db/sql/users/users.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function UserCreatedEventHandler() {}

UserCreatedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(UserCreatedEventHandler.prototype, "constructor", {
  value: UserCreatedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UserCreatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_CREATED];
};

UserCreatedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: user created");
  queryHandler.createUser(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = UserCreatedEventHandler;
