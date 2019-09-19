const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const async = require("async");
const CONSTANTS = require("../../constants");
const aggregate = require("../aggregateHelpers/users/users.aggregate");
const WriteRepo = {
  queue: async.queue(function(task, callback) {
    WriteRepo.saveEvent(task.event).then(offset => {
      callback(offset);
    });
  }),

  saveEvent(event) {
    let aggregateName = event.aggregateName;
    let aggregateID = event.aggregateID;
    let offset;
    // Get last offset from event store
    return redis
      .zrevrange(
        `AMS:${aggregateName}:${aggregateID}:events`,
        0,
        0,
        "WITHSCORES"
      )
      .then(result => {
        // if empty list, start at 0
        if (result.length == 0) offset = 0;
        else offset = parseInt(result[1]) + 1; // incr 1 last el
      })
      .then(() => {
        // save to eventstore
        let promise = redis.zadd(
          `AMS:${aggregateName}:${aggregateID}:events`,
          offset,
          JSON.stringify(event)
        );

        // sanity checker
        // redis
        //   .zrange(`events:${aggregateName}:${aggregateID}`, 0, -1, "WITHSCORES")
        //   .then(results => {
        //     console.log("[WRITE REPOSITORY]", results);
        //   });
        return promise;
      })
      .then(() => {
        // save snapshot after 50 offsets
        if ((offset + 1) % 50 === 0) {
          // could separate these into multiple files for cleaner code i guess
          switch (aggregateName) {
            case CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME:
              return aggregate.getCurrentState(aggregateID);
          }
        }
      })
      .then(aggregate => {
        if (aggregate) {
          console.log(`[WRITE REPOSITORY] Snapshot updated: ${offset}`);
          // save currentstate with offset
          redis.hset(
            `AMS:${aggregateName}:${aggregateID}:snapshot`,
            "offset",
            offset,
            "currentState",
            JSON.stringify(aggregate)
          );
        }
        return offset;
      });
  }
};

function enqueueEvent(event, callback) {
  return Promise.resolve(
    WriteRepo.queue.push({ event: event }, function(offset) {
      console.log("[WRITE REPOSITORY] Saved to event store");
      callback(offset);
    })
  );
}

module.exports = {
  enqueueEvent: enqueueEvent
};
