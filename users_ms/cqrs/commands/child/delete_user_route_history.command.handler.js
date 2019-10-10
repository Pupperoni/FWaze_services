const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");

function UserRouteHistoryDeletedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

UserRouteHistoryDeletedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(
  UserRouteHistoryDeletedCommandHandler.prototype,
  "constructor",
  {
    value: UserRouteHistoryDeletedCommandHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

UserRouteHistoryDeletedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.DELETE_USER_ROUTE_HISTORY];
};

UserRouteHistoryDeletedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    id
  );
};

UserRouteHistoryDeletedCommandHandler.prototype.validate = function(payload) {
  let valid = true;
  let reasons = [];
  return Promise.resolve(
    this.getAggregate(payload.aggregateID).then(user => {
      // user does not exist
      if (!user) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
      }
      if (!(payload.id && payload.userId)) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.DEFAULT_INVALID_DATA);
      }

      if (valid) {
        return Promise.resolve(payload);
      } else return Promise.reject(reasons);
    })
  );
};

UserRouteHistoryDeletedCommandHandler.prototype.performCommand = function(
  payload
) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_ROUTE_HISTORY_DELETED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.id,
    payload: {
      id: payload.id
    }
  });

  return Promise.resolve(events);
};

module.exports = UserRouteHistoryDeletedCommandHandler;
