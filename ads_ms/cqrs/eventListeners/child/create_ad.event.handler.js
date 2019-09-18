const queryHandler = require("../../../db/sql/map/advertisements.repository");
const BaseEventHandler = require("../base/base.event.handler");
const CONSTANTS = require("../../../constants");

function AdCreatedEventHandler() {}

AdCreatedEventHandler.prototype = Object.create(BaseEventHandler.prototype);

Object.defineProperty(AdCreatedEventHandler.prototype, "constructor", {
  value: AdCreatedEventHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

AdCreatedEventHandler.prototype.getEvents = function() {
  return [CONSTANTS.EVENTS.AD_CREATED];
};

AdCreatedEventHandler.prototype.performEvent = function(event, offset) {
  console.log("[ACTUAL EVENT HANDLER] event received: ad created");
  queryHandler.createAd(event.payload, offset);

  // create new commands
  let commands = [];

  return Promise.resolve(commands);
};

module.exports = AdCreatedEventHandler;
