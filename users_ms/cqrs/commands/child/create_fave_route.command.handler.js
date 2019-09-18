const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");
const aggregate = require("../../aggregateHelpers/users/users.aggregate");

function RouteCreatedCommandHandler() {}

RouteCreatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(RouteCreatedCommandHandler.prototype, "constructor", {
  value: RouteCreatedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

RouteCreatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.CREATE_USER_ROUTE];
};

RouteCreatedCommandHandler.prototype.getAggregate = function(id) {
  return aggregate.getCurrentState(id);
};

RouteCreatedCommandHandler.prototype.validate = function(payload) {
  let valid = true;
  let reasons = [];
  return Promise.resolve(
    aggregate.getCurrentState(payload.id).then(user => {
      // user does not exist
      if (!user) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
      }

      if (valid) {
        return Promise.resolve(valid);
      } else return Promise.reject(reasons);
    })
  );
};

RouteCreatedCommandHandler.prototype.performCommand = function(payload) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_ROUTE_CREATED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.id,
    payload: {
      id: payload.id,
      routeName: payload.routeName,
      routeId: payload.routeId,
      sourceLatitude: payload.sourceLatitude,
      sourceLongitude: payload.sourceLongitude,
      destinationLatitude: payload.destinationLatitude,
      destinationLongitude: payload.destinationLongitude,
      sourceString: payload.sourceString,
      destinationString: payload.destinationString
    }
  });

  return Promise.resolve(events);
};

module.exports = RouteCreatedCommandHandler;
