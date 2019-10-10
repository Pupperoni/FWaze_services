const knex = require("../../knex");

const Handler = {
  getRouteHistoryByUserId(userId) {
    return knex
      .raw("CALL GetRouteHistoryByUserId(?)", [userId])
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
  createRouteHistory(data) {
    return knex
      .raw("CALL CreateRouteHistory(?,?,?,?,?,?,?,?,?)", [
        data.id,
        data.userId,
        data.sourceAddress,
        data.sourceLatitude,
        data.sourceLongitude,
        data.destinationAddress,
        data.destinationLatitude,
        data.destinationLongitude,
        data.timestamp
      ])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  },

  deleteRouteHistory(data) {
    return knex
      .raw("CALL DeleteRouteHistory(?)", [data.id])
      .then(row => {
        return Promise.resolve(row[0][0]);
      })
      .catch(e => {
        throw e;
      });
  }
};

module.exports = Handler;
