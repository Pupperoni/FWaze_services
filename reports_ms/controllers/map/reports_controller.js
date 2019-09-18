const queryHandler = require("../../db/sql/map/reports.repository");
const CONSTANTS = require("../../constants");
const CommonCommandHandler = require("../../cqrs/commands/base/common.command.handler");
const shortid = require("shortid");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const finder = require("../../utilities").keys;

const reportTypes = {
  traffic_jam: 0,
  heavy_traffic_jam: 1,
  police: 2,
  closed_road: 3,
  car_stopped: 4,
  construction: 5,
  minor_accident: 6,
  major_accident: 7,
  others: 8
};

const Handler = {
  //
  // Query responsibility
  //

  // Get all reports
  getAllReports(req, res, next) {
    queryHandler
      .getAllReports()
      .then(results => {
        return res.json({ reports: results });
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get report by report id
  getReportById(req, res, next) {
    // scan to get keys
    finder
      .findSingleKeyByPattern(`RMS:report:*:${req.params.id}`)
      .then(key => {
        return redis.hgetall(key);
      })
      .then(result => {
        if (!result)
          return res
            .status(400)
            .json({ msg: CONSTANTS.ERRORS.REPORT_NOT_EXISTS });
        // count number of votes in a report
        redis.scard(`RMS:report:${req.params.id}:upvoters`).then(count => {
          result.votes = count;
          return res.json({ report: result });
        });
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get all reports of a specific type
  getReportsByType(req, res, next) {
    queryHandler
      .getReportsByType(reportTypes[req.params.type])
      .then(results => {
        if (results.length == 0)
          return res
            .status(400)
            .json({ msg: CONSTANTS.ERRORS.REPORT_TYPE_EMPTY });
        return res.json({ reports: results });
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get all reports enclosed in an area
  getReportsByRange(req, res, next) {
    let right = req.query.tright.split(",")[1];
    let left = req.query.bleft.split(",")[1];
    let top = req.query.tright.split(",")[0];
    let bottom = req.query.bleft.split(",")[0];
    queryHandler
      .getReportsByBorder(left, right, bottom, top)
      .then(results => {
        return res.json({ reports: results });
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get all reports enclosed in an area
  getReportsByRangeExplain(req, res, next) {
    let right = req.query.tright.split(",")[1];
    let left = req.query.bleft.split(",")[1];
    let top = req.query.tright.split(",")[0];
    let bottom = req.query.bleft.split(",")[0];
    queryHandler
      .getReportsByBorderExplain(left, right, bottom, top)
      .then(results => {
        return res.json({ reports: results });
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get all reports enclosed in an area of a specific type (this is always used - most specific)
  getReportsByTypeRange(req, res, next) {
    let right = req.query.tright.split(",")[1];
    let left = req.query.bleft.split(",")[1];
    let top = req.query.tright.split(",")[0];
    let bottom = req.query.bleft.split(",")[0];
    queryHandler
      .getReportsByTypeBorder(
        reportTypes[req.params.type],
        left,
        right,
        bottom,
        top
      )
      .then(results => {
        return res.json({ reports: results });
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get all reports enclosed in an area of a specific type
  getReportsByTypeRangeExplain(req, res, next) {
    let right = req.query.tright.split(",")[1];
    let left = req.query.bleft.split(",")[1];
    let top = req.query.tright.split(",")[0];
    let bottom = req.query.bleft.split(",")[0];
    queryHandler
      .getReportsByTypeBorderExplain(
        reportTypes[req.params.type],
        left,
        right,
        bottom,
        top
      )
      .then(results => {
        return res.json({ reports: results });
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get vote count
  getVoteCount(req, res, next) {
    // count number of votes in a report
    redis.scard(`RMS:report:${req.params.id}:upvoters`).then(count => {
      return res.json({ result: count });
    });
  },

  // Get user and vote report pair
  getUserVotePair(req, res, next) {
    redis
      .sismember(`report:${req.params.reportId}:upvoters`, req.params.userId)
      .then(result => {
        return res.json(result);
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  },

  // Get profile picture of a report
  getImage(req, res, next) {
    let options = {
      root: "/usr/src/app/"
    };
    finder
      .findSingleKeyByPattern(`RMS:report:*:${req.params.id}`)
      .then(key => {
        return redis.hgetall(key);
      })
      .then(report => {
        if (report) {
          if (report.photoPath) return res.sendFile(report.photoPath, options);
          else return res.json({ msg: CONSTANTS.ERRORS.FILE_NOT_FOUND });
        } else
          return res
            .status(400)
            .json({ msg: CONSTANTS.ERRORS.REPORT_NOT_EXISTS });
      })
      .catch(e => {
        return res
          .status(500)
          .json({ msg: CONSTANTS.ERRORS.DEFAULT_SERVER_ERROR, err: e });
      });
  },

  //
  //  Command responsibility section
  //

  // Add a new report
  createReport(req, res, next) {
    const payload = {
      // generate unique id
      id: shortid.generate(),
      userId: req.body.userId,
      userName: req.body.userName,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      location: req.body.location,
      type: req.body.type,
      file: req.file
    };
    payload.aggregateID = payload.id;

    CommonCommandHandler.sendCommand(payload, CONSTANTS.COMMANDS.CREATE_REPORT)
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

  // Add vote instance
  addVote(req, res, next) {
    const payload = {
      id: req.body.reportId,
      userId: req.body.userId
    };

    payload.aggregateID = payload.id;
    CommonCommandHandler.sendCommand(
      payload,
      CONSTANTS.COMMANDS.CREATE_REPORT_VOTE
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

  // Remove vote instance
  deleteVote(req, res, next) {
    const payload = {
      id: req.body.reportId,
      userId: req.body.userId
    };
    payload.aggregateID = payload.id;

    CommonCommandHandler.sendCommand(
      payload,
      CONSTANTS.COMMANDS.DELETE_REPORT_VOTE
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
  }
};

module.exports = Handler;
