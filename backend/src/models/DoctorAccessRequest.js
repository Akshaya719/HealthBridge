const mongoose = require("mongoose");

const doctorAccessRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      maxlength: 500,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

doctorAccessRequestSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

module.exports = mongoose.model("DoctorAccessRequest", doctorAccessRequestSchema);
