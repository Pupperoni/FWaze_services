const express = require("express");
const multer = require("multer");
const router = express.Router();

const queryHandler = require("../db/sql/map/advertisements.repository");

const eventStoreHelper = require("../cqrs/writeRepositories/event_store.helper")();
const CommonAggregateHandler = require("../cqrs/aggregateHelpers/base/common.aggregate")(
  eventStoreHelper
);

const writeRepo = require("../cqrs/writeRepositories/write.repository")(
  eventStoreHelper,
  CommonAggregateHandler
);
const broker = require("../kafka");

const CommonCommandHandler = require("../cqrs/commands/base/common.command.handler")(
  writeRepo,
  broker,
  CommonAggregateHandler
);

const eventHandler = require("../cqrs/eventListeners/base/common.event.handler")(
  broker,
  CommonCommandHandler
);
const boundedContextHandler = require("../cqrs/boundedContext/base/common.bounded-context.handler")(
  broker,
  writeRepo
);

const adHandler = require("../controllers/map/advertisements_controller")(
  queryHandler,
  CommonCommandHandler
);
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

// Display map
router.get("/", (req, res, next) => {
  res.send("Welcome to map | FWaze");
});

/* ADVERTISEMENTS */

// Get ads by range
router.get("/ads/range", adHandler.getAdsByRange);

// Get ads by range
router.get("/ads/explain/range", adHandler.getAdsByRangeExplain);

// Get all ads
router.get("/ads", adHandler.getAllAds);

// Get ad by id
router.get("/ads/:id", adHandler.getAdById);

// Get ad image
router.get("/ads/:id/image", adHandler.getImage);

// Add new advertisement
router.post("/ads/new", adUpload.single("photo"), adHandler.createAd);

module.exports = router;
