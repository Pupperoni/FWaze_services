const queryHandler = require("../../../db/sql/users/users.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function UpdateUserWorkEventHandler() {}

UpdateUserWorkEventHandler.prototype = Object.create(
  BaseEventHandler.prototype
);

Object.defineProperty(UpdateUserWorkEventHandler.prototype, "constructor", {
  value: UpdateUserWorkEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UpdateUserWorkEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_WORK_UPDATED];
};

UpdateUserWorkEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: user work updated");
  queryHandler.setWorkAd(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = UpdateUserWorkEventHandler;
