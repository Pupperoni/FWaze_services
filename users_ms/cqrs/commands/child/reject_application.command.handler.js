const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");

function ApplicationRejectedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

ApplicationRejectedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(
  ApplicationRejectedCommandHandler.prototype,
  "constructor",
  {
    value: ApplicationRejectedCommandHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

ApplicationRejectedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.REJECT_USER_APPLICATION];
};

ApplicationRejectedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    id
  );
};

ApplicationRejectedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];

  // get role of user that made the request (should be admin) and check if admin
  return Promise.resolve(
    this.getAggregate(payload.adminId)
      .then(user => {
        // user does not exist
        if (!user) {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.USER_NOT_PERMITTED);
        }
        // should be admin
        else if (user.role != 2) {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.USER_NOT_PERMITTED);
        }
        if (valid) {
          // check if application exists
          return this.getAggregate(payload.userId);
        } else return Promise.reject(reasons);
      })
      .then(user => {
        // user does not exist
        if (!user) {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
        }
        // application does not exist
        else if (typeof user.status === "undefined") {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.APPLICATION_NOT_EXISTS);
        }
        // application not pending
        else if (user.status !== 0) {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.DUPLICATE_APPLICATION);
        }
        if (valid) return Promise.resolve(payload);
        else return Promise.reject(reasons);
      })
  );
};

ApplicationRejectedCommandHandler.prototype.performCommand = function(payload) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_APPLICATION_REJECTED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.userId,
    payload: {
      id: payload.id,
      userId: payload.userId
    }
  });

  return Promise.resolve(events);
};

module.exports = ApplicationRejectedCommandHandler;
