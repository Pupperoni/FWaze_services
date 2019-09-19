const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const CONSTANTS = require("../../../constants");

module.exports = {
  getCurrentState(id) {
    // get history of events of user id

    let user = {};
    let lastOffset = 0;
    return Promise.resolve(
      // check if snapshot exists
      redis
        .hgetall(
          `RMS:${CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME}:${id}:snapshot`
        )
        .then(snapshot => {
          // snapshot exists - start here
          if (snapshot.offset && snapshot.currentState) {
            user = JSON.parse(snapshot.currentState);
            lastOffset = parseInt(snapshot.offset) + 1;
          }
          return redis.zrange(
            `RMS:${CONSTANTS.AGGREGATES.USER_AGGREGATE_NAME}:${id}:events`,
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
            }
          });

          // user does not exist if it was not created
          if (!user.id) return null;

          // current state of user
          return user;
        })
    );
  }
};
