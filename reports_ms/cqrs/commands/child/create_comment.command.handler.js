const BaseCommandHandler = require("../base/base.command.handler");
const shortid = require("shortid");
const CONSTANTS = require("../../../constants");

function CommentCreatedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

CommentCreatedCommandHandler.prototype = Object.create(
  BaseCommandHandler.prototype
);

Object.defineProperty(CommentCreatedCommandHandler.prototype, "constructor", {
  value: CommentCreatedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

CommentCreatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.CREATE_REPORT_COMMENT];
};

CommentCreatedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.REPORT_AGGREGATE_NAME,
    id
  );
};

CommentCreatedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];

  let reportCheck = this.getAggregate(payload.reportId) // check if report exists
    .then(report => {
      // report doesn't exist
      if (!report) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.REPORT_NOT_EXISTS);
      }
      return Promise.resolve(valid);
    });
  let userCheck = this.aggregate
    .getCurrentState(CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME, payload.userId) // check if user exists
    .then(user => {
      if (!user) {
        valid = false;
        reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
      }
      return Promise.resolve(valid);
    });

  return Promise.all([reportCheck, userCheck]).then(results => {
    if (valid) return Promise.resolve(payload);
    else return Promise.reject(reasons);
  });
};

CommentCreatedCommandHandler.prototype.performCommand = function(payload) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.REPORT_COMMENT_CREATED,
    aggregateName: CONSTANTS.AGGREGATES.REPORT_AGGREGATE_NAME,
    aggregateID: payload.reportId,
    payload: {
      id: payload.id,
      userId: payload.userId,
      userName: payload.userName,
      reportId: payload.reportId,
      body: payload.body,
      timestamp: payload.timestamp
    }
  });

  return Promise.resolve(events);
};

module.exports = CommentCreatedCommandHandler;
