const queryHandler = require("../../../db/sql/map/comments.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function CommentCreatedEventHandler() {}

CommentCreatedEventHandler.prototype = Object.create(
  BaseEventHandler.prototype
);

Object.defineProperty(CommentCreatedEventHandler.prototype, "constructor", {
  value: CommentCreatedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

CommentCreatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.REPORT_COMMENT_CREATED];
};

CommentCreatedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: comment created");
  queryHandler.createComment(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = CommentCreatedEventHandler;
