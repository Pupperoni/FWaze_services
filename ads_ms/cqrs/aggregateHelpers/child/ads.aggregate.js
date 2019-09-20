const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const CONSTANTS = require("../../../constants");
const BaseAggregateHandler = require("../base/base.aggregate");

function AdsAggregateHandler() {}

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
  let lastOffset = 0;
  return Promise.resolve(
    // check if snapshot exists
    redis
      .hgetall(`AMS:${CONSTANTS.AGGREGATES.AD_AGGREGATE_NAME}:${id}:snapshot`)
      .then(snapshot => {
        // snapshot exists - start here
        if (snapshot.offset && snapshot.currentState) {
          ad = JSON.parse(snapshot.currentState);
          lastOffset = parseInt(snapshot.offset) + 1;
        }
        return redis.zrange(
          `AMS:${CONSTANTS.AGGREGATES.AD_AGGREGATE_NAME}:${id}:events`,
          lastOffset,
          -1
        );
      })
      .then(history => {
        // Recount history
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
