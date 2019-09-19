const CONSTANTS = require("../../../constants");
const writeRepo = require("../../writeRepositories/write.repository");

function UsersBoundedContextHandler() {}

UsersBoundedContextHandler.prototype.getAggregates = function() {
  return [CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME];
};

UsersBoundedContextHandler.prototype.performCopy = function(event) {
  return writeRepo.enqueueEvent(event, () => {});
};

module.exports = UsersBoundedContextHandler;
