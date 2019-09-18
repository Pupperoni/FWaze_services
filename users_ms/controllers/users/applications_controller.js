const queryHandler = require("../../db/sql/users/applications.repository");
const CommonCommandHandler = require("../../cqrs/commands/base/common.command.handler");
const CONSTANTS = require("../../constants");
const shortid = require("shortid");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

//
// Query responsibility
//

const Handler = {
  // Get an application based on user id
  getApplicationByUserId(req, res, next) {
    // Redis get
    redis
      .get(`UMS:user:${req.params.id}:application`)
      .then(result => {
        if (!result)
          return res.json({ msg: CONSTANTS.ERRORS.APPLICATION_NOT_EXISTS });
        else {
          redis.hgetall(`UMS:application:${result}`).then(result => {
            if (result) return res.json({ data: result });
          });
        }
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get all applications
  getAllApplications(req, res, next) {
    // Redis get
    queryHandler
      .getAllApplications()
      .then(results => {
        return res.json({ data: results });
      })
      .catch(e => {
        return res.status(400).json({ err: e });
      });
  },

  // Get pending applications
  getPendingApplications(req, res, next) {
    // Redis get
    queryHandler
      .getPendingApplications()
      .then(results => {
        return res.json({ data: results });
      })
      .catch(e => {
        return res.status(400).json({ err: e });
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
        return res.status(400).json({ err: e });
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
        return res.status(400).json({ err: e });
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
        return res.status(400).json({ err: e });
      });
  }
};

module.exports = Handler;
