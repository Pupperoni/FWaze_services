const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const async = require("async");
const broker = require("../../kafka");
const CONSTANTS = require("../../constants");
const queryHandler = require("../../db/sql/map/advertisements.repository");

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
        redis.zadd(
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
        return offset;
      });
  }
};

broker.aggregateSubscribe(event => {
  // Filter
  if (event.eventName === CONSTANTS.EVENTS.USER_CREATED) {
    // do it
    WriteRepo.saveEvent(event);
  } else if (event.eventName === CONSTANTS.EVENTS.USER_UPDATED) {
    // do it
    WriteRepo.saveEvent(event);
    // TODO - separate component
    if (event.payload.name) queryHandler.updateAdUserName(event.payload);
  }
});

module.exports = {
  enqueueEvent(event, callback) {
    return Promise.resolve(
      WriteRepo.queue.push({ event: event }, function(offset) {
        console.log("[WRITE REPOSITORY] Saved to event store");
        callback(offset);
      })
    );
  }
};
