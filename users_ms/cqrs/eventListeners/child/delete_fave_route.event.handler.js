const queryHandler = require("../../../db/sql/users/users.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function RouteDeletedEventHandler() {}

RouteDeletedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(RouteDeletedEventHandler.prototype, "constructor", {
  value: RouteDeletedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

RouteDeletedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_ROUTE_DELETED];
};

RouteDeletedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: fave route deleted");
  queryHandler.deleteFaveRoute(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = RouteDeletedEventHandler;
