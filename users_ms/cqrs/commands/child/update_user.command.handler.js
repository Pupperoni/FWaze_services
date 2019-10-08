const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");
const validator = require("../../../utils/validators");

function UserUpdatedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

UserUpdatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(UserUpdatedCommandHandler.prototype, "constructor", {
  value: UserUpdatedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UserUpdatedCommandHandler.prototype.getCommands = function() {
  return [
    CONSTANTS.COMMANDS.UPDATE_USER,
    CONSTANTS.COMMANDS.UPDATE_USER_HOME,
    CONSTANTS.COMMANDS.UPDATE_USER_WORK
  ];
};

UserUpdatedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    id
  );
};

UserUpdatedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];
  // email valid?

  if (payload.email && !validator.validateEmail(payload.email)) {
    valid = false;
    reasons.push(CONSTANTS.ERRORS.EMAIL_INVALID_FORMAT);
  }
  if (valid) return Promise.resolve(payload);
  else return Promise.reject(reasons);
};

UserUpdatedCommandHandler.prototype.performCommand = function(payload) {
  let events = [];
  // Create event instance
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_UPDATED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.id,
    payload: {
      id: payload.id,
      name: payload.name,
      email: payload.email
    }
  });

  // check if file was uploaded
  if (payload.file) events[0].payload.avatarPath = payload.file.path;

  if (
    payload.home.latitude !== "undefined" ||
    payload.home.longitude !== "undefined"
  ) {
    events.push({
      eventId: shortid.generate(),
      eventName: CONSTANTS.EVENTS.USER_HOME_UPDATED,
      aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
      aggregateID: payload.id,
      payload: {
        id: payload.id,
        latitude: payload.home.latitude,
        longitude: payload.home.longitude,
        address: payload.home.address
      }
    });
  }
  if (
    payload.work.latitude !== "undefined" ||
    payload.work.longitude !== "undefined"
  )
    events.push({
      eventId: shortid.generate(),
      eventName: CONSTANTS.EVENTS.USER_WORK_UPDATED,
      aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
      aggregateID: payload.id,
      payload: {
        id: payload.id,
        latitude: payload.work.latitude,
        longitude: payload.work.longitude,
        address: payload.work.address
      }
    });

  return Promise.resolve(events);
};

module.exports = UserUpdatedCommandHandler;
