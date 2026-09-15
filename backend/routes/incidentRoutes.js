const express = require("express");

const {
    getAllIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
    updateStatus
} = require("../controllers/incidentController");

const router = express.Router();

// Get all incidents
router.get("/", getAllIncidents);

// Get single incident
router.get("/:id", getIncidentById);

// Create incidents
router.post("/", createIncident);

// Update incident
router.put("/:id", updateIncident);

// Delete incident
router.delete("/:id", deleteIncident);

// Update incident status
router.patch("/:id/status", updateStatus);

module.exports = router;