const queryHandler = require("../../../db/sql/map/reports.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function ReportCreatedEventHandler() {}

ReportCreatedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(ReportCreatedEventHandler.prototype, "constructor", {
  value: ReportCreatedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

ReportCreatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.REPORT_CREATED];
};

ReportCreatedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: report created");
  queryHandler.createReport(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = ReportCreatedEventHandler;
