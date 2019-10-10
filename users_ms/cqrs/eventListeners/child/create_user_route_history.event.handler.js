const queryHandler = require("../../../db/sql/users/route_history.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function UserRouteHistoryCreatedEventHandler() {}

UserRouteHistoryCreatedEventHandler.prototype = Object.create(
  BaseEventHandler.prototype
);

Object.defineProperty(
  UserRouteHistoryCreatedEventHandler.prototype,
  "constructor",
  {
    value: UserRouteHistoryCreatedEventHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

UserRouteHistoryCreatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_ROUTE_HISTORY_CREATED];
};

UserRouteHistoryCreatedEventHandler.prototype.performEvent = function(event) {
  console.log(
    "[ACTUAL EVENT HANDLER] event received: user route history created"
  );
  queryHandler.createRouteHistory(event.payload);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = UserRouteHistoryCreatedEventHandler;
