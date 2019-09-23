const CONSTANTS = require("../../../constants");
const BaseAggregateHandler = require("../base/base.aggregate");

function AdsAggregateHandler(eventStoreHelper) {
  BaseAggregateHandler.call(this, eventStoreHelper);
}

AdsAggregateHandler.prototype = Object.create(BaseAggregateHandler.prototype);

Object.defineProperty(AdsAggregateHandler.prototype, "constructor", {
  value: AdsAggregateHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

AdsAggregateHandler.prototype.getAggregates = function() {
  return [CONSTANTS.AGGREGATES.AD_AGGREGATE_NAME];
};

AdsAggregateHandler.prototype.getCurrentState = function(id) {
  let ad = {};
  return Promise.resolve(
    this.eventStoreHelper
      .getSnapshotAndEvents(CONSTANTS.AGGREGATES.AD_AGGREGATE_NAME, id)
      .then(results => {
        if (results.aggregate) ad = results.aggregate;
        let history = results.events;
        history.forEach(event => {
          event = JSON.parse(event);
          let payload = event.payload;

          switch (event.eventName) {
            case CONSTANTS.EVENTS.AD_CREATED:
              ad = payload;
              break;
          }
        });

        // user does not exist if it was not created
        if (!ad.id) return null;

        // current state of user
        return ad;
      })
  );
};

module.exports = AdsAggregateHandler;
