const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const CONSTANTS = require("../../../constants");
const BaseAggregateHandler = require("../base/base.aggregate");

function UsersAggregateHandler() {}

UsersAggregateHandler.prototype = Object.create(BaseAggregateHandler.prototype);

Object.defineProperty(UsersAggregateHandler.prototype, "constructor", {
  value: UsersAggregateHandler,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

UsersAggregateHandler.prototype.getAggregates = function() {
  return [CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME];
};

UsersAggregateHandler.prototype.getCurrentState = function(id) {
  let user = {};
  let lastOffset = 0;
  return Promise.resolve(
    // check if snapshot exists
    redis
      .hgetall(`AMS:${CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME}:${id}:snapshot`)
      .then(snapshot => {
        // snapshot exists - start here
        if (snapshot.offset && snapshot.currentState) {
          user = JSON.parse(snapshot.currentState);
          lastOffset = parseInt(snapshot.offset) + 1;
        }
        return redis.zrange(
          `AMS:${CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME}:${id}:events`,
          lastOffset,
          -1
        );
      })
      .then(history => {
        // Recount history
        // console.log(`Start at offset: ${lastOffset}`);
        // console.log("User:");
        // console.log(user);
        // console.log("History:");
        // console.log(history);
        history.forEach(event => {
          event = JSON.parse(event);
          let payload = event.payload;

          switch (event.eventName) {
            case CONSTANTS.EVENTS.USER_CREATED:
              user.id = payload.id;
              user.name = payload.name;
              user.email = payload.email;
              user.password = payload.password;
              if (payload.role) user.role = payload.role;
              else user.role = 0;
              break;
            case CONSTANTS.EVENTS.USER_UPDATED:
              if (payload.name) user.name = payload.name;
              if (payload.email) user.email = payload.email;
              if (payload.role) user.role = payload.role;
              if (payload.avatarPath) user.avatarPath = payload.avatarPath;
              break;
          }
        });

        // user does not exist if it was not created
        if (!user.id) return null;

        // current state of user
        return user;
      })
  );
};

module.exports = UsersAggregateHandler;
