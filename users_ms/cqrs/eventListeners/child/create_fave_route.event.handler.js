const queryHandler = require("../../../db/sql/users/users.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function RouteCreatedEventHandler() {}

RouteCreatedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(RouteCreatedEventHandler.prototype, "constructor", {
  value: RouteCreatedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

RouteCreatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_ROUTE_CREATED];
};

RouteCreatedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: fave route created");
  queryHandler.createFaveRoute(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = RouteCreatedEventHandler;
