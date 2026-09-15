const Incident = require("../models/Incident");

// Get All Incidents
const getAllIncidents = async (req, res) => {
    try {
        const { severity, type, status } = req.query;

        const filter = {};

        if (severity) {
            filter.severity = severity;
        }

        if (type) {
            filter.type = type;
        }

        if (status) {
            filter.status = status;
        }

        const incidents = await Incident.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json(incidents);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Get Single Incident
const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate("reportedBy", "name email");

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json(incident);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Create Incident
const createIncident = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            severity,
            location
        } = req.body;

        if (!title || !description || !type || !severity || !location) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        const incident = await Incident.create({
            title,
            description,
            type,
            severity,
            location,
            reportedBy: req.user ? req.user.id : null
        });

        res.status(201).json({
            message: "Incident created successfully",
            incident
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Update Incident
const updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            message: "Incident updated successfully",
            incident
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Delete Incident
const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(
            req.params.id
        );

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            message: "Incident deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Update Status
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.status(200).json({
            message: "Status updated successfully",
            incident
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
    updateStatus
};
