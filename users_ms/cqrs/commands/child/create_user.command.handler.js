const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const bcrypt = require("bcryptjs");
const CONSTANTS = require("../../../constants");
const aggregate = require("../../aggregateHelpers/users/users.aggregate");
const validator = require("../../../utilities").validators;

function UserCreatedCommandHandler() {}

UserCreatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(UserCreatedCommandHandler.prototype, "constructor", {
  value: UserCreatedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UserCreatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.CREATE_USER];
};

UserCreatedCommandHandler.prototype.getAggregate = function(id) {
  return aggregate.getCurrentState(id);
};

UserCreatedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];
  // passwords match?
  if (payload.password !== payload.confirmPassword) {
    valid = false;
    reasons.push(CONSTANTS.ERRORS.PASSWORDS_NOT_MATCH);
  }

  // email valid?
  if (!validator.validateEmail(payload.email)) {
    valid = false;
    reasons.push(CONSTANTS.ERRORS.EMAIL_INVALID_FORMAT);
  }

  if (valid) return Promise.resolve(valid);
  else return Promise.reject(reasons);
};

UserCreatedCommandHandler.prototype.performCommand = function(payload) {
  // Hash password
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(payload.password, salt);
  payload.password = hash;

  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.USER_CREATED,
    aggregateName: CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME,
    aggregateID: payload.id,
    payload: {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      password: payload.password
    }
  });

  return Promise.resolve(events);
};

module.exports = UserCreatedCommandHandler;
