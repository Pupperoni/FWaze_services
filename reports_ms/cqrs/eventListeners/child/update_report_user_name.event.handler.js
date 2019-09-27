const commentQueryHandler = require("../../../db/sql/map/comments.repository");
const reportQueryHandler = require("../../../db/sql/map/reports.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function ReportUserNameUpdatedEventHandler() {}

ReportUserNameUpdatedEventHandler.prototype = Object.create(
  BaseEventHandler.prototype
);

Object.defineProperty(
  ReportUserNameUpdatedEventHandler.prototype,
  "constructor",
  {
    value: ReportUserNameUpdatedEventHandler,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  }
);

ReportUserNameUpdatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.USER_UPDATED];
};

ReportUserNameUpdatedEventHandler.prototype.performEvent = function(
  event,
  offset
) {
  console.log(
    "[ACTUAL EVENT HANDLER] event received: report user name updated"
  );
  reportQueryHandler.updateReportUserName(event.payload);
  commentQueryHandler.updateCommentUserName(event.payload);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = ReportUserNameUpdatedEventHandler;
