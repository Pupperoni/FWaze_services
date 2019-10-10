const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");

function UserRouteHistoryCreatedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

UserRouteHistoryCreatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(
  UserRouteHistoryCreatedCommandHandler.prototype,
  "constructor",
  {
    value: UserRouteHistoryCreatedCommandHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

UserRouteHistoryCreatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.CREATE_USER_ROUTE_HISTORY];
};

UserRouteHistoryCreatedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    id
  );
};

UserRouteHistoryCreatedCommandHandler.prototype.validate = function(payload) {
  let valid = true;
  let reasons = [];
  return Promise.resolve(
    this.getAggregate(payload.aggregateID).then(user => {
      // user does not exist
      if (!user) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
      }
      if (
        !(
          payload.userId &&
          payload.sourceAddress &&
          payload.sourceLatitude &&
          payload.destinationAddress &&
          payload.destinationLatitude &&
          payload.destinationLongitude &&
          payload.timestamp
        )
      ) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.DEFAULT_INVALID_DATA);
      }

      if (valid) {
        return Promise.resolve(payload);
      } else return Promise.reject(reasons);
    })
  );
};

UserRouteHistoryCreatedCommandHandler.prototype.performCommand = function(
  payload
) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_ROUTE_HISTORY_CREATED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.id,
    payload: {
      id: payload.id,
      userId: payload.userId,
      sourceAddress: payload.sourceAddress,
      sourceLatitude: payload.sourceLatitude,
      sourceLongitude: payload.sourceLongitude,
      destinationAddress: payload.destinationAddress,
      destinationLatitude: payload.destinationLatitude,
      destinationLongitude: payload.destinationLongitude,
      timestamp: payload.timestamp
    }
  });

  return Promise.resolve(events);
};

module.exports = UserRouteHistoryCreatedCommandHandler;
