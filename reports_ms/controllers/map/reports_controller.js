const CONSTANTS = require("../../constants");
const shortid = require("shortid");

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

const controller = function(queryHandler, CommonCommandHandler) {
  const Handler = {
    //
    // Query responsibility
    //

    // Get all reports (deprecated)
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
      queryHandler
        .getReportById(req.params.id)
        .then(result => {
          if (!result.id)
            return res
              .status(404)
              .json({ msg: CONSTANTS.ERRORS.REPORT_NOT_EXISTS });
          // count number of votes in a report
          queryHandler.getReportUpvotersCount(req.params.id).then(count => {
            result.votes = count;
            return res.json({ report: result });
          });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get all reports of a specific type (deprecated)
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

    // Get all reports enclosed in an area (deprecated)
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
          if (results.length === 0)
            return res.status(200).json({ reports: results });
          else res.json({ reports: results });
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
      queryHandler
        .getReportUpvotersCount(req.params.id)
        .then(count => {
          if (count === 0) return res.status(200).json({ result: count });
          else return res.json({ result: count });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get user and vote report pair
    getUserVotePair(req, res, next) {
      queryHandler
        .getUserVotePair(req.params.reportId, req.params.userId)
        .then(result => {
          if (!result) return res.status(200).json(result);
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
      return queryHandler
        .getReportById(req.params.id)
        .then(report => {
          if (report.id) {
            if (report.photoPath)
              return res.sendFile(report.photoPath, options);
            else
              return res
                .status(200)
                .json({ msg: CONSTANTS.ERRORS.FILE_NOT_FOUND });
          } else
            return res
              .status(404)
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

      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.CREATE_REPORT
      )
        .then(result => {
          return res.json({
            msg: CONSTANTS.SUCCESS.DEFAULT_SUCCESS,
            data: result
          });
        })
        .catch(e => {
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_EXISTS)) status = 401;
          else if (e.includes(CONSTANTS.ERRORS.INVALID_REPORT_TYPE))
            status = 400;
          else status = 400;
          return res.status(status).json({ err: e });
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
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_EXISTS)) status = 401;
          else if (e.includes(CONSTANTS.ERRORS.REPORT_NOT_EXISTS)) status = 404;
          else status = 400;
          return res.status(status).json({ err: e });
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
          let status;
          if (e.includes(CONSTANTS.ERRORS.USER_NOT_EXISTS)) status = 401;
          else if (e.includes(CONSTANTS.ERRORS.REPORT_NOT_EXISTS)) status = 404;
          else status = 400;
          return res.status(status).json({ err: e });
        });
    }
  };
  return Handler;
};

module.exports = controller;
