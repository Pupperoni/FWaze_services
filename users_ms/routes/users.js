const express = require("express");
const multer = require("multer");
const router = express.Router();

const userQueryHandler = require("../db/sql/users/users.repository");
const applicationQueryHandler = require("../db/sql/users/applications.repository");

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

let userHandler = require("../controllers/users/users_controller")(
  userQueryHandler,
  CommonCommandHandler
);

let applicationHandler = require("../controllers/users/applications_controller")(
  applicationQueryHandler,
  CommonCommandHandler
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile_pictures/");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.id + "-" + Date.now() + ".png");
  }
});

const upload = multer({ storage: storage });

/* Advertiser Applications */

// Get pending applications
router.get("/apply/pending", applicationHandler.getPendingApplications);

// Get pending applications
router.get("/apply", applicationHandler.getAllApplications);

// Get application by user id
router.get("/apply/:id", applicationHandler.getApplicationByUserId);

// Add new application
router.post("/apply/new", applicationHandler.createApplication);

// Approve application
router.put("/apply/approve", applicationHandler.approveApplication);

// Reject application
router.put("/apply/reject", applicationHandler.rejectApplication);

// Create new user account
router.post("/new", userHandler.createUser);

/* Login user */
router.post("/login", userHandler.loginUser);

// Edit user account
router.put("/edit", upload.single("avatar"), userHandler.updateUser);

// Add fave route
router.post("/faves/new", userHandler.createFaveRoute);

// Delete fave route
router.post("/faves/delete", userHandler.deleteFaveRoute);

// Get fave routes
router.get("/faves/:id", userHandler.getFaveRoutes);

// Get image of user
router.get("/:id/image", userHandler.getImage);

// Get single user
router.get("/:id", userHandler.getUserById);

/* GET users listing. */
router.get("/", userHandler.getAllUsers);

module.exports = router;
