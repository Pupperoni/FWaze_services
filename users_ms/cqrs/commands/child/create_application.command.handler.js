const BaseCommandHandler = require("../base/base.command.handler");
const CONSTANTS = require("../../../constants");
const shortid = require("shortid");

function ApplicationCreatedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

ApplicationCreatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(
  ApplicationCreatedCommandHandler.prototype,
  "constructor",
  {
    value: ApplicationCreatedCommandHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

ApplicationCreatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.CREATE_USER_APPLICATION];
};

ApplicationCreatedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    id
  );
};

ApplicationCreatedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];

  // get role of user and check if regular
  return Promise.resolve(
    this.getAggregate(payload.userId).then(user => {
      // user does not exist
      if (!user) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
      }
      // user is not regular (not valid)
      else if (user.role != 0) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.USER_NOT_PERMITTED);
      } else {
        // if user exists and pending/approved - dont create
        if (
          typeof user.status !== "undefined" &&
          (user.status === 0 || user.status === 1)
        ) {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.DUPLICATE_APPLICATION);
        }
      }

      if (valid) return Promise.resolve(payload);
      else return Promise.reject(reasons);
    })
  );
};

ApplicationCreatedCommandHandler.prototype.performCommand = function(payload) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_APPLICATION_CREATED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.aggregateID,
    payload: {
      id: payload.id,
      userId: payload.userId,
      userName: payload.userName,
      timestamp: payload.timestamp
    }
  });

  return Promise.resolve(events);
};

module.exports = ApplicationCreatedCommandHandler;
