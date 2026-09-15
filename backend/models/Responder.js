const mongoose = require("mongoose");

const responderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "POLICE",
        "FIRE_FIGHTER",
        "MEDICAL",
        "VOLUNTEER",
        "RESCUE_TEAM"
      ],
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
      }
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "AVAILABLE"
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Responder", responderSchema);
