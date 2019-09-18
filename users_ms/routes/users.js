const express = require("express");
const multer = require("multer");

let router = express.Router();
let userHandler = require("../controllers/users/users_controller");
let applicationHandler = require("../controllers/users/applications_controller");
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
