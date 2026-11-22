const mongoose = require("mongoose");
const DoctorAccessRequest = require("../models/DoctorAccessRequest");
const User = require("../models/User");

async function restorePatientRoleIfRequestWasNotApproved(userId, requestId) {
  const latestRequest = await DoctorAccessRequest.findById(requestId).select("status");
  if (latestRequest?.status === "approved") {
    return;
  }

  const revertedUser = await User.findOneAndUpdate(
    { _id: userId, role: "Doctor" },
    { $set: { role: "Patient" } },
    { runValidators: true }
  );
  if (!revertedUser) {
    console.error("Could not restore user role after Doctor access approval failed");
  }
}

async function createDoctorAccessRequest(req, res) {
  try {
    const user = await User.findById(req.user.id).select("role isActive");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is inactive" });
    }
    if (user.role !== "Patient") {
      return res.status(409).json({ message: "Only Patient accounts can request Doctor access" });
    }

    const pendingRequest = await DoctorAccessRequest.findOne({
      userId: user._id,
      status: "pending",
    });
    if (pendingRequest) {
      return res.status(409).json({
        message: "You already have a pending Doctor access request",
        request: pendingRequest,
      });
    }

    const request = await DoctorAccessRequest.create({ userId: user._id });
    return res.status(201).json({
      success: true,
      message: "Doctor access request submitted",
      request,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You already have a pending Doctor access request" });
    }
    console.error("Create Doctor access request failed:", error.message);
    return res.status(500).json({ message: "Unable to submit Doctor access request" });
  }
}

async function getMyDoctorAccessRequest(req, res) {
  try {
    const request = await DoctorAccessRequest.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("status reviewNotes createdAt reviewedAt");

    return res.status(200).json({ success: true, request });
  } catch (error) {
    console.error("Get Doctor access request failed:", error.message);
    return res.status(500).json({ message: "Unable to get Doctor access request status" });
  }
}

async function getPendingDoctorAccessRequests(req, res) {
  try {
    const requests = await DoctorAccessRequest.find({ status: "pending" })
      .populate("userId", "userName email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get pending Doctor access requests failed:", error.message);
    return res.status(500).json({ message: "Unable to get Doctor access requests" });
  }
}

async function approveDoctorAccessRequest(req, res) {
  let updatedUserId = null;
  let requestId = null;
  try {
    ({ requestId } = req.params);
    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await DoctorAccessRequest.findOne({
      _id: requestId,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ message: "Pending Doctor access request not found" });
    }

    const user = await User.findOneAndUpdate(
      { _id: request.userId, role: "Patient", isActive: { $ne: false } },
      { $set: { role: "Doctor" } },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(409).json({ message: "This account is no longer eligible for Doctor access" });
    }
    updatedUserId = user._id;

    const updatedRequest = await DoctorAccessRequest.findOneAndUpdate(
      { _id: request._id, status: "pending" },
      {
        $set: {
          status: "approved",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          reviewNotes: "",
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      await restorePatientRoleIfRequestWasNotApproved(user._id, request._id);
      updatedUserId = null;
      return res.status(409).json({ message: "This request was already reviewed" });
    }
    updatedUserId = null;

    return res.status(200).json({
      success: true,
      message: "Doctor access approved. The user can now complete their Doctor profile.",
      request: updatedRequest,
    });
  } catch (error) {
    if (updatedUserId) {
      try {
        await restorePatientRoleIfRequestWasNotApproved(updatedUserId, requestId);
      } catch (rollbackError) {
        console.error("Could not restore user role after Doctor access approval failed:", rollbackError.message);
      }
    }
    console.error("Approve Doctor access request failed:", error.message);
    return res.status(500).json({ message: "Unable to approve Doctor access request" });
  }
}

async function rejectDoctorAccessRequest(req, res) {
  try {
    const { requestId } = req.params;
    const reviewNotes = typeof req.body?.reviewNotes === "string" ? req.body.reviewNotes.trim() : "";

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }
    if (reviewNotes.length > 500) {
      return res.status(400).json({ message: "Review notes cannot exceed 500 characters" });
    }

    const request = await DoctorAccessRequest.findOneAndUpdate(
      { _id: requestId, status: "pending" },
      {
        $set: {
          status: "rejected",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          reviewNotes,
        },
      },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Pending Doctor access request not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor access request rejected",
      request,
    });
  } catch (error) {
    console.error("Reject Doctor access request failed:", error.message);
    return res.status(500).json({ message: "Unable to reject Doctor access request" });
  }
}

module.exports = {
  createDoctorAccessRequest,
  getMyDoctorAccessRequest,
  getPendingDoctorAccessRequests,
  approveDoctorAccessRequest,
  rejectDoctorAccessRequest,
};
