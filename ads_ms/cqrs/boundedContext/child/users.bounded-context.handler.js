const CONSTANTS = require("../../../constants");
const BaseBoundedContextHandler = require("../base/base.bounded-context.handler");

function UsersBoundedContextHandler(writeRepo) {
  BaseBoundedContextHandler.call(this, writeRepo);
}

UsersBoundedContextHandler.prototype = Object.create(
  BaseBoundedContextHandler.prototype
);

Object.defineProperty(UsersBoundedContextHandler.prototype, "constructor", {
  value: UsersBoundedContextHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UsersBoundedContextHandler.prototype.getAggregates = function() {
  return [CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME];
};

UsersBoundedContextHandler.prototype.performCopy = function(event) {
  return this.writeRepo.enqueueEvent(event, () => {});
};

module.exports = UsersBoundedContextHandler;
