const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "FIRE",
        "FLOOD",
        "EARTHQUAKE",
        "ACCIDENT",
        "MEDICAL",
        "ROAD_BLOCK",
        "BUILDING_COLLAPSE",
        "OTHER"
      ],
      required: true
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },

    location: {
      latitude: {
        type: Number,
        required: true
      },

      longitude: {
        type: Number,
        required: true
      },

      address: {
        type: String
      }
    },

    status: {
      type: String,
      enum: ["ACTIVE", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "ACTIVE"
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Incident", incidentSchema);