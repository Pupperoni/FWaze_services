const CONSTANTS = require("../../constants");
const shortid = require("shortid");

//
// Query responsibility
//

const controller = function(queryHandler, CommonCommandHandler) {
  const Handler = {
    // Get an application based on user id
    getApplicationByUserId(req, res, next) {
      queryHandler
        .getApplicationByUserId(req.params.id)
        .then(result => {
          if (!result) return res.status(200).json({ data: result });
          else return res.json({ data: result });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get all applications
    getAllApplications(req, res, next) {
      queryHandler
        .getAllApplications()
        .then(results => {
          if (results.length === 0)
            return res.status(200).json({ data: results });
          else return res.json({ data: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get pending applications
    getPendingApplications(req, res, next) {
      queryHandler
        .getPendingApplications()
        .then(results => {
          if (results.length === 0)
            return res.status(200).json({ data: results });
          else return res.json({ data: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    //
    //  Commands responsibility section
    //

    // Add a new application for advertiser
    createApplication(req, res, next) {
      const payload = {
        id: shortid.generate(),
        userId: req.body.userId,
        userName: req.body.userName,
        timestamp: req.body.timestamp
      };

      payload.aggregateID = payload.userId;
      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.CREATE_USER_APPLICATION
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
          else if (e.includes(CONSTANTS.ERRORS.USER_NOT_PERMITTED))
            status = 403;
          else if (e.includes(CONSTANTS.ERRORS.DUPLICATE_APPLICATION))
            status = 409;
          else status = 400;
          return res.status(status).json({ err: e });
        });
    },

    // Approve application
    approveApplication(req, res, next) {
      const payload = {
        id: req.body.id,
        adminId: req.body.adminId,
        userId: req.body.userId
      };

      payload.aggregateID = payload.userId;
      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.APPROVE_USER_APPLICATION
      )
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: {
              id: payload.id,
              userId: payload.userId
            }
          });
        })
        .catch(e => {
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_PERMITTED)) status = 403;
          else if (e.includes(CONSTANTS.ERRORS.APPLICATION_NOT_EXISTS))
            status = 404;
          else if (e.includes(CONSTANTS.ERRORS.DUPLICATE_APPLICATION))
            status = 409;
          else status = 400;
          return res.status(status).json({ err: e });
        });
    },

    // Reject application
    rejectApplication(req, res, next) {
      const payload = {
        id: req.body.id,
        adminId: req.body.adminId,
        userId: req.body.userId
      };

      payload.aggregateID = payload.userId;
      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.REJECT_USER_APPLICATION
      )
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: {
              id: payload.id,
              userId: payload.userId
            }
          });
        })
        .catch(e => {
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_PERMITTED)) status = 403;
          else if (e.includes(CONSTANTS.ERRORS.USER_NOT_EXISTS)) status = 404;
          else if (e.includes(CONSTANTS.ERRORS.APPLICATION_NOT_EXISTS))
            status = 404;
          else if (e.includes(CONSTANTS.ERRORS.DUPLICATE_APPLICATION))
            status = 409;
          else status = 400;
          return res.status(status).json({ err: e });
        });
    }
  };
  return Handler;
};

module.exports = controller;
