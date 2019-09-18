const queryHandler = require("../../../db/sql/map/reports.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function VoteCreatedEventHandler() {}

VoteCreatedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(VoteCreatedEventHandler.prototype, "constructor", {
  value: VoteCreatedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

VoteCreatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.REPORT_VOTE_CREATED];
};

VoteCreatedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: vote created");
  queryHandler.addVote(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = VoteCreatedEventHandler;
