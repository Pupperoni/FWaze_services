const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");
const validator = require("../../../utils/validators");

function UserHomeUpdatedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

UserHomeUpdatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(UserHomeUpdatedCommandHandler.prototype, "constructor", {
  value: UserHomeUpdatedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UserHomeUpdatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.UPDATE_USER_HOME];
};

UserHomeUpdatedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    id
  );
};

UserHomeUpdatedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];
  // email valid?

  if (payload.email && !validator.validateEmail(payload.email)) {
    valid = false;
    reasons.push(CONSTANTS.ERRORS.EMAIL_INVALID_FORMAT);
  }
  if (valid) return Promise.resolve(valid);
  else return Promise.reject(reasons);
};

UserHomeUpdatedCommandHandler.prototype.performCommand = function(payload) {
  let events = [];
  // Create event instance
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_HOME_UPDATED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.aggregateId,
    payload: {
      aggregateId: payload.aggregateId,
      latitude: payload.home.latitude,
      longitude: payload.home.longitude,
      address: payload.home.address
    }
  });

  return Promise.resolve(events);
};

module.exports = UserHomeUpdatedCommandHandler;
