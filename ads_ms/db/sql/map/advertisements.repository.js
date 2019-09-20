const knex = require("../../knex");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const finder = require("../../../utilities").keys;
const Handler = {
  /*
   * Query
   */

  getAds() {
    return knex
      .raw("CALL GetAllAds()")
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  getAdById(id) {
    return finder
      .findSingleKeyByPattern(`AMS:ad:*:${id}`)
      .then(key => {
        return redis.hgetall(key);
      })
      .catch(e => {
        throw e;
      });
  },

  getAdsByBorder(xl, xu, yl, yu) {
    return knex
      .raw("CALL GetAdsByBorder(?,?,?,?)", [xl, xu, yl, yu])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  getAdsByBorderExplain(xl, xu, yl, yu) {
    return knex
      .raw("CALL EGetAdsByBorder(?,?,?,?)", [xl, xu, yl, yu])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  /*
   * Commands
   */

  createAd(data, offset) {
    // Add to redis
    if (data.photoPath) {
      redis.hmset(
        `AMS:ad:${data.userId}:${data.id}`,
        "id",
        data.id,
        "caption",
        data.caption,
        "userId",
        data.userId,
        "userName",
        data.userName,
        "longitude",
        data.longitude,
        "latitude",
        data.latitude,
        "location",
        data.location,
        "photoPath",
        data.photoPath,
        "offset",
        offset
      );
    } else {
      redis.hmset(
        `AMS:ad:${data.userId}:${data.id}`,
        "id",
        data.id,
        "caption",
        data.caption,
        "userId",
        data.userId,
        "userName",
        data.userName,
        "longitude",
        data.longitude,
        "latitude",
        data.latitude,
        "location",
        data.location,
        "offset",
        offset
      );
    }

    return knex
      .raw("CALL CreateAd(?,?,?)", [data.id, data.longitude, data.latitude])
      .then(row => {
        return Promise.resolve(row[0]);
      })
      .catch(e => {
        throw e;
      });
  },

  updateAdUserName(data) {
    finder.findMultiKeyByPattern(`AMS:ad:${data.id}:*`).then(keys => {
      keys.forEach(key => {
        redis.hset(key, "userName", data.name);
      });
    });
  }
};

module.exports = Handler;
