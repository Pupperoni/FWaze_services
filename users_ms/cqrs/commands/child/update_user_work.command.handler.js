const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");
const aggregate = require("../../aggregateHelpers/base/common.aggregate");
const validator = require("../../../utilities").validators;

function UserWorkUpdatedCommandHandler() {}

UserWorkUpdatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(UserWorkUpdatedCommandHandler.prototype, "constructor", {
  value: UserWorkUpdatedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UserWorkUpdatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.UPDATE_USER_WORK];
};

UserWorkUpdatedCommandHandler.prototype.getAggregate = function(id) {
  return aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    id
  );
};

UserWorkUpdatedCommandHandler.prototype.validate = function(payload) {
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

UserWorkUpdatedCommandHandler.prototype.performCommand = function(payload) {
  let events = [];
  // Create event instance
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_WORK_UPDATED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.aggregateId,
    payload: {
      aggregateId: payload.aggregateId,
      latitude: payload.work.latitude,
      longitude: payload.work.longitude,
      address: payload.work.address
    }
  });

  return Promise.resolve(events);
};

module.exports = UserWorkUpdatedCommandHandler;
