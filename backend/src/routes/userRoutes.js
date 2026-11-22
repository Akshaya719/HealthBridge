const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { patientRoleMiddleware } = require("../middlewares/roleMiddleware");
const {
  createDoctorAccessRequest,
  getMyDoctorAccessRequest,
} = require("../controllers/doctorAccessRequestController");

const {
  updatePassword,
  getPrescription,
  viewProfile,
  updateProfile,
  getMe
} = require("../controllers/userController");


router.put("/updatePassword", authMiddleware, updatePassword);


router.get("/homepage", authMiddleware, patientRoleMiddleware, viewProfile);


router.get("/prescription", authMiddleware, patientRoleMiddleware, getPrescription);


router.put("/updateProfile", authMiddleware, updateProfile);


router.get("/me", authMiddleware, getMe);

router.post(
  "/doctor-access-request",
  authMiddleware,
  patientRoleMiddleware,
  createDoctorAccessRequest
);
router.get("/doctor-access-request", authMiddleware, getMyDoctorAccessRequest);

module.exports = router;
