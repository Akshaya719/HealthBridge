const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  patientRoleMiddleware,
  verifiedDoctorRoleMiddleware,
  verifiedDoctorOrOtherRoleMiddleware,
} = require("../middlewares/roleMiddleware");

const {
  createPrescription,
  getPrescriptionById,
  getPrescriptionsForPatient,
  getPrescriptionsForDoctor,
  updatePrescription,
  deletePrescription
} = require("../controllers/prescriptionController");

// ----------------------------------------------
// DOCTOR — CREATE PRESCRIPTION
// POST /api/prescriptions/create
// ----------------------------------------------
router.post(
  "/create",
  authMiddleware,
  verifiedDoctorRoleMiddleware,
  createPrescription
);

// ----------------------------------------------
// PATIENT — VIEW THEIR PRESCRIPTIONS
// GET /api/prescriptions/my
// ----------------------------------------------
router.get(
  "/my",
  authMiddleware,
  patientRoleMiddleware,
  getPrescriptionsForPatient
);

// ----------------------------------------------
// DOCTOR — VIEW PRESCRIPTIONS THEY ISSUED
// GET /api/prescriptions/doctor
// ----------------------------------------------
router.get(
  "/doctor",
  authMiddleware,
  verifiedDoctorRoleMiddleware,
  getPrescriptionsForDoctor
);

// ----------------------------------------------
// GET PRESCRIPTION BY ID (doctor OR patient involved)
// GET /api/prescriptions/:id
// ----------------------------------------------
router.get(
  "/:id",
  authMiddleware,
  verifiedDoctorOrOtherRoleMiddleware,
  getPrescriptionById
);

// ----------------------------------------------
// DOCTOR — UPDATE PRESCRIPTION
// PATCH /api/prescriptions/update
// ----------------------------------------------
router.patch(
  "/update",
  authMiddleware,
  verifiedDoctorRoleMiddleware,
  updatePrescription
);

// ----------------------------------------------
// DELETE PRESCRIPTION
// DELETE /api/prescriptions/:id
// ----------------------------------------------
router.delete(
  "/:id",
  authMiddleware,
  verifiedDoctorOrOtherRoleMiddleware,
  deletePrescription
);

module.exports = router;
