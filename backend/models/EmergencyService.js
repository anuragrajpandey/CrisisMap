const mongoose = require("mongoose");

const emergencyServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "HOSPITAL",
        "POLICE",
        "FIRE_STATION",
        "SHELTER",
        "RELIEF_CENTER",
        "AMBULANCE"
      ],
      required: true
    },

    address: {
      type: String,
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

    phone: {
      type: String
    },

    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "EmergencyService",
  emergencyServiceSchema
);