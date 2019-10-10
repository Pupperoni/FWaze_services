const queryHandler = require("../../../db/sql/users/route_history.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function UserRouteHistoryDeletedEventHandler() {}

UserRouteHistoryDeletedEventHandler.prototype = Object.create(
  BaseEventHandler.prototype
);

Object.defineProperty(
  UserRouteHistoryDeletedEventHandler.prototype,
  "constructor",
  {
    value: UserRouteHistoryDeletedEventHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

UserRouteHistoryDeletedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_ROUTE_HISTORY_DELETED];
};

UserRouteHistoryDeletedEventHandler.prototype.performEvent = function(event) {
  console.log(
    "[ACTUAL EVENT HANDLER] event received: user route history deleted"
  );
  queryHandler.deleteRouteHistory(event.payload);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = UserRouteHistoryDeletedEventHandler;
