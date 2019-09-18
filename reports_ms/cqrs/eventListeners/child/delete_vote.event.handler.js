const queryHandler = require("../../../db/sql/map/reports.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function VoteDeletedEventHandler() {}

VoteDeletedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(VoteDeletedEventHandler.prototype, "constructor", {
  value: VoteDeletedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

VoteDeletedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.REPORT_VOTE_DELETED];
};

VoteDeletedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: vote deleted");
  queryHandler.removeVote(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = VoteDeletedEventHandler;
