const Doctor = require("../models/Doctor");

// PATIENT ROLE CHECK
function patientRoleMiddleware(req, res, next) {
  try {
    if (!req.user || req.user.role !== "Patient") {
      return res.status(403).json({ message: "Patient access only" });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({ message: "User account is blocked" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}



// DOCTOR ROLE CHECK
function doctorRoleMiddleware(req, res, next) {
  try {
    if (!req.user || req.user.role !== "Doctor") {
      return res.status(403).json({ message: "Doctor access only" });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({ message: "Doctor account is blocked" });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function verifiedDoctorRoleMiddleware(req, res, next) {
  try {
    if (!req.user || req.user.role !== "Doctor") {
      return res.status(403).json({ message: "Doctor access only" });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({ message: "Doctor account is blocked" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id }).select("verificationStatus");
    if (!doctor || doctor.verificationStatus !== "approved") {
      return res.status(403).json({
        message: "Your Doctor profile is awaiting Admin verification",
      });
    }

    next();
  } catch (error) {
    console.error("Doctor verification check failed:", error.message);
    return res.status(500).json({ message: "Unable to verify Doctor access" });
  }
}

async function verifiedDoctorOrOtherRoleMiddleware(req, res, next) {
  if (req.user?.role !== "Doctor") {
    return next();
  }

  return verifiedDoctorRoleMiddleware(req, res, next);
}



// ADMIN ROLE CHECK
function adminRoleMiddleware(req, res, next) {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}



module.exports = {
  patientRoleMiddleware,
  doctorRoleMiddleware,
  verifiedDoctorRoleMiddleware,
  verifiedDoctorOrOtherRoleMiddleware,
  adminRoleMiddleware,
};
