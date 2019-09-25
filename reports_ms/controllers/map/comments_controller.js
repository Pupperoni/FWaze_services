const shortid = require("shortid");
const CONSTANTS = require("../../constants");

const controller = function(queryHandler, CommonCommandHandler) {
  const Handler = {
    //
    //  Query responsibility
    //

    // Get all comments
    getAllComments(req, res, next) {
      queryHandler
        .getComments()
        .then(results => {
          return res.json({ data: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get comment by comment id
    getCommentById(req, res, next) {
      queryHandler
        .getCommentById(req.params.id)
        .then(result => {
          if (!result)
            return res
              .status(400)
              .json({ msg: CONSTANTS.ERRORS.COMMENT_NOT_EXISTS });
          return res.json({ data: result });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get comments by report id (list down all comments on a report)
    getCommentsByReportId(req, res, next) {
      return queryHandler
        .getCommentsByReportId(req.params.id, req.query.page)
        .then(results => {
          if (results.length === 0) {
            return res.json({
              msg: CONSTANTS.ERRORS.COMMENTS_NOT_FOUND,
              data: []
            });
          }
          return res.json({ data: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get comments by report id (list down all comments on a report)
    getCommentsByReportIdExplain(req, res, next) {
      queryHandler
        .getCommentsByReportIdExplain(req.params.id, req.query.page)
        .then(results => {
          if (results.length == 0)
            return res.json({
              msg: CONSTANTS.ERRORS.COMMENTS_NOT_FOUND,
              data: []
            });
          return res.json({ data: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get comments by report id (list down all comments on a report)
    countCommentsByReportId(req, res, next) {
      queryHandler
        .countCommentsByReportId(req.params.id)
        .then(results => {
          return res.json({ data: results["COUNT(*)"] });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    // Get comments by user id (list down all comments made by a user)
    getCommentsByUserId(req, res, next) {
      queryHandler
        .getCommentsByUserId(req.params.id)
        .then(results => {
          if (results.length == 0)
            return res
              .status(400)
              .json({ msg: CONSTANTS.ERRORS.COMMENTS_NOT_FOUND });
          return res.json({ data: results });
        })
        .catch(e => {
          return res.status(500).json({ err: e });
        });
    },

    //
    //  Commands responsibility section
    //

    // Add a comment
    createComment(req, res, next) {
      const payload = {
        id: shortid.generate(),
        userId: req.body.userId,
        userName: req.body.userName,
        reportId: req.body.reportId,
        body: req.body.body,
        timestamp: req.body.timestamp
      };
      payload.aggregateID = payload.reportId;
      CommonCommandHandler.sendCommand(
        payload,
        CONSTANTS.COMMANDS.CREATE_REPORT_COMMENT
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
  return Handler;
};
module.exports = controller;
