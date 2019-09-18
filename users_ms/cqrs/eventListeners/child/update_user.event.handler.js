const queryHandler = require("../../../db/sql/users/users.repository");
const adQueryHandler = require("../../../db/sql/users/applications.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function UserUpdatedEventHandler() {}

UserUpdatedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(UserUpdatedEventHandler.prototype, "constructor", {
  value: UserUpdatedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UserUpdatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_UPDATED];
};

UserUpdatedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: user updated");
  queryHandler.updateUser(event.payload, offset);
  if (event.payload.name)
    adQueryHandler.updateApplicationUserName(event.payload);
  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = UserUpdatedEventHandler;
