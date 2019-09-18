const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");
const reportAggregate = require("../../aggregateHelpers/map/reports.aggregate");
const userAggregate = require("../../aggregateHelpers/users/users.aggregate");

function VoteDeletedCommandHandler() {}

VoteDeletedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(VoteDeletedCommandHandler.prototype, "constructor", {
  value: VoteDeletedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

VoteDeletedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.DELETE_REPORT_VOTE];
};

VoteDeletedCommandHandler.prototype.getAggregate = function(id) {
  return reportAggregate.getCurrentState(id);
};

VoteDeletedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];

  let reportCheck = reportAggregate
    .getCurrentState(payload.id) // check if report exists
    .then(report => {
      // report doesn't exist
      if (!report) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.REPORT_NOT_EXISTS);
      }
      return Promise.resolve(valid);
    });
  let userCheck = userAggregate
    .getCurrentState(payload.userId) // check if user exists
    .then(user => {
      if (!user) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
      }
      return Promise.resolve(valid);
    });

  return Promise.all([reportCheck, userCheck]).then(results => {
    results.forEach(value => {
      // false value found so it must not be valid
      if (!value) valid = value;
    });

    if (valid) Promise.resolve(valid);
    else Promise.reject(reasons);
  });
};

VoteDeletedCommandHandler.prototype.performCommand = function(payload) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.REPORT_VOTE_DELETED,
    aggregateName: CONSTANTS.AGGREGATES.REPORT_AGGREGATE_NAME,
    aggregateID: payload.id,
    payload: payload
  });

  return Promise.resolve(events);
};

module.exports = VoteDeletedCommandHandler;
