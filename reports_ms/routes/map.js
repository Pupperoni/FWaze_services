const express = require("express");
const multer = require("multer");

const router = express.Router();
const reportHandler = require("../controllers/map/reports_controller");
const commentHandler = require("../controllers/map/comments_controller");

const adstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/ads/");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.userId + "-" + Date.now() + ".png");
  }
});

const adUpload = multer({ storage: adstorage });

const reportstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/reports/");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.userId + "-" + Date.now() + ".png");
  }
});

const reportUpload = multer({ storage: reportstorage });

// Update votes count of report up
router.put("/reports/up", reportHandler.addVote);

// Update votes count of report down
router.put("/reports/down", reportHandler.deleteVote);

// Get vote count
router.get("/reports/:reportId/votes", reportHandler.getVoteCount);

// Get user and vote pair (if exists)
router.get("/reports/:reportId/voted/:userId", reportHandler.getUserVotePair);

// Get reports by border range (?tright=50,150&bleft=120,100)
router.get("/reports/range", reportHandler.getReportsByRange);

// Get reports by border range (?tright=50,150&bleft=120,100)
router.get("/reports/explain/range", reportHandler.getReportsByRangeExplain);

// Get report by report id
router.get("/reports/:id", reportHandler.getReportById);

// Get reports by type and range
router.get("/reports/type/:type/range", reportHandler.getReportsByTypeRange);

// Get reports by type and range
router.get(
  "/reports/type/:type/explain/range",
  reportHandler.getReportsByTypeRangeExplain
);

// Get reports by type
router.get("/reports/type/:type", reportHandler.getReportsByType);

// Get report image
router.get("/reports/:id/image", reportHandler.getImage);

// Add new report
router.post(
  "/reports/new",
  reportUpload.single("photo"),
  reportHandler.createReport
);

// Get all reports
router.get("/reports", reportHandler.getAllReports);

/* COMMENTS */

// Get all comments
router.get("/comments", commentHandler.getAllComments);

// Get comment by id
router.get("/comments/:id", commentHandler.getCommentById);

// Get comments by report id
router.get("/comments/report/:id", commentHandler.getCommentsByReportId);

// Get comments by report id
router.get(
  "/comments/report/:id/explain",
  commentHandler.getCommentsByReportIdExplain
);

// Get comments by report id
router.get(
  "/comments/report/:id/count",
  commentHandler.countCommentsByReportId
);

// Get comments by user id
router.get("/comments/user/:id", commentHandler.getCommentsByUserId);

// Add new comment
router.post("/comments/new", commentHandler.createComment);

module.exports = router;
