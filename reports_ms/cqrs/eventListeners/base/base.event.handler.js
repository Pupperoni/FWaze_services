const CONSTANTS = require("../../../constants");

function BaseEventHandler(writeRepo) {
  this.writeRepo = writeRepo;
}

BaseEventHandler.prototype.getEvents = function() {
  return [];
};

BaseEventHandler.prototype.performEvent = function(event, offset) {
  // do it
  return Promise.resolve([]);
};

module.exports = BaseEventHandler;
