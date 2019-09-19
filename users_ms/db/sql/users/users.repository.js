const knex = require("../../knex");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
let finder = require("../../../utilities").keys;

const Handler = {
  /*
   * Query
   */

  // Fetch all user names and emails
  getAllUsers() {
    return knex
      .raw("CALL GetAllUsers()")
      .then(row => {
        // for some reason, the sql query is also sent as the 2nd element
        // so we return only the first
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Fetch users using name
  getUserByName(name) {
    return knex
      .raw("CALL GetUserByName(?)", [name])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Fetch users using email
  getUserByEmail(email) {
    return knex
      .raw("CALL GetUserByEmail(?)", [email])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Fetch a user's name and email
  getUserById(id) {
    return knex
      .raw("CALL GetUserById(?)", [id])
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

  // Insert new user to 'users'
  createUser(data, offset) {
    redis
      .hmset(
        `UMS:user:${data.id}`,
        `id`,
        data.id,
        `name`,
        data.name,
        `email`,
        data.email,
        `password`,
        data.password,
        `role`,
        data.role,
        "offset",
        offset
      )
      .then(() => {
        // To access a user by his name, we store his id somewhere
        redis.set(`UMS:user:name:${data.name}`, data.id);

        // save home and work (initially none)
        redis.hmset(
          `UMS:user:${data.id}:home`,
          `latitude`,
          "",
          `longitude`,
          "",
          `address`,
          ""
        );
        redis.hmset(
          `UMS:user:${data.id}:work`,
          `latitude`,
          "",
          `longitude`,
          "",
          `address`,
          ""
        );
      });

    return knex
      .raw("CALL CreateUser(?,?,?,?)", [
        data.id,
        data.name,
        data.email,
        data.password
      ])
      .then(row => {
        return Promise.resolve(row[0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Update user details
  updateUser(data, offset) {
    // Update redis data
    if (data.name) {
      // delete old name checker
      redis.del(`UMS:user:name:${data.name}`);
      // set new name
      redis.hset(`UMS:user:${data.id}`, `name`, data.name);

      // Update name checker
      redis.set(`UMS:user:name:${data.name}`, data.id);
    }

    if (data.email) redis.hset(`UMS:user:${data.id}`, `email`, data.email);
    if (data.role) redis.hset(`UMS:user:${data.id}`, `role`, data.role);

    if (data.avatarPath)
      redis.hset(`UMS:user:${data.id}`, `avatarPath`, data.avatarPath);

    redis.hset(`UMS:user:${data.id}`, "offset", offset);

    // Update MySQL data
    if (data.name && data.email) {
      return knex
        .raw("CALL UpdateUser(?,?,?)", [data.name, data.email, data.id])
        .then(row => {
          return Promise.resolve(row[0]);
        })
        .catch(e => {
          throw e;
        });
    }
  },

  // Set a home address for a user
  setHomeAd(data, offset) {
    redis.hset(`UMS:user:${data.id}`, "offset", offset);
    redis.hmset(
      `UMS:user:${data.id}:home`,
      `latitude`,
      data.latitude,
      `longitude`,
      data.longitude,
      `address`,
      data.address
    );
    return knex
      .raw("CALL SetHomeAd(?,?)", [data.id, data.address])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Set a work address for a user
  setWorkAd(data, offset) {
    redis.hset(`UMS:user:${data.id}`, "offset", offset);
    redis.hmset(
      `UMS:user:${data.id}:work`,
      `latitude`,
      data.latitude,
      `longitude`,
      data.longitude,
      `address`,
      data.address
    );
    return knex
      .raw("CALL SetWorkAd(?,?)", [data.id, data.address])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Add a route to favorites
  createFaveRoute(data, offset) {
    redis.hset(`UMS:user:${data.id}`, "offset", offset);
    return knex
      .raw("CALL CreateFaveRoute(?,?,?,?,?,?,?,?,?)", [
        data.routeId,
        data.routeName,
        data.sourceLatitude,
        data.sourceLongitude,
        data.destinationLatitude,
        data.destinationLongitude,
        data.sourceString,
        data.destinationString,
        data.id
      ])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Add a route to favorites
  deleteFaveRoute(data, offset) {
    redis.hset(`UMS:user:${data.id}`, "offset", offset);
    return knex
      .raw("CALL DeleteFaveRoute(?)", [data.routeId])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  // Get all faved routes
  getFaveRoutes(userId) {
    return knex
      .raw("CALL GetRoutesByUserId(?)", [userId])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  }
};

module.exports = Handler;
