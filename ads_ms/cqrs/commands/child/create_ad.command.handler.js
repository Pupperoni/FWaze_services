const BaseCommandHandler = require("../base/base.command.handler");
const CONSTANTS = require("../../../constants");
const shortid = require("shortid");

function AdCreatedCommandHandler(CommonAggregateHandler) {
  BaseCommandHandler.call(this, CommonAggregateHandler);
}

AdCreatedCommandHandler.prototype = Object.create(BaseCommandHandler.prototype);

Object.defineProperty(AdCreatedCommandHandler.prototype, "constructor", {
  value: AdCreatedCommandHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

AdCreatedCommandHandler.prototype.getCommands = function() {
  return [CONSTANTS.COMMANDS.CREATE_AD];
};

AdCreatedCommandHandler.prototype.getAggregate = function(id) {
  return this.aggregate.getCurrentState(
    CONSTANTS.AGGREGATES.AD_AGGREGATE_NAME,
    id
  );
};

AdCreatedCommandHandler.prototype.validate = function(payload) {
  // validate data sent here
  let valid = true;
  let reasons = [];

  // get role of user and check if advertiser
  return Promise.resolve(
    this.aggregate
      .getCurrentState(CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME, payload.userId)
      .then(user => {
        // user does not exist
        if (!user) {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.USER_NOT_EXISTS);
        }
        // user is regular (not valid)
        else if (user.role === "0" || user.role === 0) {
          valid = false;
          reasons.push(CONSTANTS.ERRORS.USER_NOT_PERMITTED);
        }

        if (valid) return Promise.resolve(payload);
        else return Promise.reject(reasons);
      })
  );
};

AdCreatedCommandHandler.prototype.performCommand = function(payload) {
  // Create event instance
  let events = [];
  events.push({
    eventId: shortid.generate(),
    eventName: CONSTANTS.EVENTS.AD_CREATED,
    aggregateName: CONSTANTS.AGGREGATES.AD_AGGREGATE_NAME,
    aggregateID: payload.aggregateID,
    payload: {
      id: payload.id,
      userId: payload.userId,
      userName: payload.userName,
      caption: payload.caption,
      latitude: payload.latitude.toString(),
      longitude: payload.longitude.toString(),
      location: payload.location
    }
  });
  // check if file is uploaded
  if (payload.file) events[0].payload.photoPath = payload.file.path;

  return Promise.resolve(events);
};

module.exports = AdCreatedCommandHandler;
