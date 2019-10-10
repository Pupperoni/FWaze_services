const shortid = require("shortid");
const CONSTANTS = require("../../constants");

const controller = function(queryHandler, CommonCommandHandler) {
  const Handler = {
    /**
     * Query Responsibility
     */
    getRouteHistoryByUserId(req, res, next) {
      queryHandler
        .getRouteHistoryByUserId(req.params.id)
        .then(results => {
          let history = [];
          results.forEach(route => {
            history.push({
              id: route.id,
              userId: route.user_id,
              sourceAddress: route.sourceAddress,
              sourcePosition: route.sourcePosition,
              destinationAddress: route.destinationAddress,
              destinationPosition: route.destinationPosition,
              timestamp: route.created_at
            });
          });
          return res.status(200).json({ history: history });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },
    /**
     * Commands
     */
    createRouteHistory(req, res, next) {
      const payload = {
        id: shortid.generate(),
        userId: req.body.userId,
        sourceAddress: req.body.source.address,
        sourceLatitude: req.body.source.latitude,
        sourceLongitude: req.body.source.longitude,
        destinationAddress: req.body.destination.address,
        destinationLatitude: req.body.destination.latitude,
        destinationLongitude: req.body.destination.longitude,
        timestamp: req.body.timestamp
      };
      payload.aggregateID = payload.userId;

      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.CREATE_USER_ROUTE_HISTORY
      )
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: result
          });
        })
        .catch(e => {
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_EXISTS)) status = 404;
          else if (e.includes(CONSTANTS.ERRORS.DEFAULT_INVALID_DATA))
            status = 400;
          else status = 400;
          return res.status(status).json({ err: e });
        });
    },
    deleteRouteHistory(req, res, next) {
      const payload = {
        id: req.body.id,
        userId: req.body.userId
      };
      payload.aggregateID = payload.userId;

      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.DELETE_USER_ROUTE_HISTORY
      )
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: result
          });
        })
        .catch(e => {
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_EXISTS)) status = 404;
          else if (e.includes(CONSTANTS.ERRORS.DEFAULT_INVALID_DATA))
            status = 400;
          else status = 400;
          return res.status(status).json({ err: e });
        });
    }
  };
  return Handler;
};

module.exports = controller;
