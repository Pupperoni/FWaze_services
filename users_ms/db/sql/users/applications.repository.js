const knex = require("../../knex");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const Handler = {
  /*
   * Query
   */

  // Get all applications
  getAllApplications() {
    return knex
      .raw("CALL GetAllApplications()")
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Get all pending applications
  getPendingApplications() {
    return knex
      .raw("CALL GetPendingApplications()")
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  getApplicationByUserId(id) {
    return redis
      .get(`UMS:user:${id}:application`)
      .then(result => {
        if (!result) return Promise.resolve();
        return redis.hgetall(`UMS:application:${result}`);
      })
      .catch(e => {
        throw e;
      });
  },

  /*
   * Commands
   */

  // Create an application
  createApplication(data, offset) {
    // create application instance
    redis.hmset(
      `UMS:application:${data.id}`,
      `userId`,
      data.userId,
      `status`,
      0,
      `timestamp`,
      data.timestamp
    );

    redis.hset(`UMS:user:${data.userId}`, "offset", offset);

    // Set current application to user
    redis.set(`UMS:user:${data.userId}:application`, data.id);

    return knex
      .raw("CALL CreateApplication(?,?,?,?)", [
        data.id,
        data.userId,
        data.userName,
        data.timestamp
      ])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Get all pending applications
  approveApplication(data, offset) {
    // change status
    redis.hmset(`UMS:application:${data.userId}`, `status`, 1);
    redis.hset(`UMS:user:${data.userId}`, "offset", offset);

    // unlink application to user
    redis.del(`UMS:user:${data.userId}:application`);
    return knex
      .raw("CALL ApproveApplication(?)", [data.id])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Get all pending applications
  rejectApplication(data, offset) {
    // change status
    redis.hmset(`UMS:application:${data.userId}`, `status`, -1);
    redis.hset(`UMS:user:${data.userId}`, "offset", offset);

    // unlink application to user
    redis.del(`UMS:user:${data.userId}:application`);
    return knex
      .raw("CALL RejectApplication(?)", [data.id])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  updateApplicationUserName(data) {
    return knex
      .raw("CALL UpdateApplicationUserName(?,?)", [data.id, data.name])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  }
};

module.exports = Handler;
