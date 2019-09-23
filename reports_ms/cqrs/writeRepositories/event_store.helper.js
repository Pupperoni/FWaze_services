const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

function eventStoreHelper() {
  const helper = {
    getSnapshotAndEvents: function(aggregateName, id) {
      let aggregate;
      let events;
      let lastOffset = 0;
      return Promise.resolve(
        this.getSnapshot(aggregateName, id)
          .then(lastSnapshot => {
            // snapshot exists - start here
            if (lastSnapshot.offset && lastSnapshot.currentState) {
              aggregate = JSON.parse(lastSnapshot.currentState);
              lastOffset = parseInt(lastSnapshot.offset) + 1;
            } else {
              aggregate = null;
            }
            return this.getEventsAfterSnapOffset(aggregateName, id, lastOffset);
          })
          .then(newEvents => {
            events = newEvents;
            return {
              aggregate: aggregate,
              events: events
            };
          })
      );
    },

    getSnapshot: function(aggregateName, id) {
      return redis.hgetall(`RMS:${aggregateName}:${id}:snapshot`);
    },

    getEventsAfterSnapOffset: function(aggregateName, id, offset) {
      return redis.zrange(`RMS:${aggregateName}:${id}:events`, offset, -1);
    },

    getLastOffset: function(aggregateName, id) {
      let offset;
      return redis
        .zrevrange(`RMS:${aggregateName}:${id}:events`, 0, 0, "WITHSCORES")
        .then(result => {
          // if empty list, start at 0
          if (result.length == 0) offset = 0;
          else offset = parseInt(result[1]) + 1; // incr 1 last el
          return offset;
        });
    },

    addSnapshot: function(aggregateName, id, aggregate, offset) {
      console.log(`[EVENT STORE HELPER] Snapshot updated: ${offset}`);
      // save currentstate with offset
      return redis.hset(
        `RMS:${aggregateName}:${id}:snapshot`,
        "offset",
        offset,
        "currentState",
        JSON.stringify(aggregate)
      );
    },

    addEvent: function(aggregateName, id, offset, event) {
      return redis.zadd(
        `RMS:${aggregateName}:${id}:events`,
        offset,
        JSON.stringify(event)
      );
    }
  };
  return helper;
}

module.exports = eventStoreHelper;
