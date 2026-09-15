const EmergencyService = require("../models/EmergencyService");

// Get All Services
const getAllServices = async (req, res) => {
    try {
        const { type } = req.query;

        const filter = {};

        if (type) {
            filter.type = type;
        }

        const services = await EmergencyService.find(filter);

        res.status(200).json(services);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Get Single Service
const getServiceById = async (req, res) => {
    try {
        const service = await EmergencyService.findById(
            req.params.id
        );

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json(service);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Create Service
const createService = async (req, res) => {
    try {
        const service = await EmergencyService.create(req.body);

        res.status(201).json({
            message: "Service created successfully",
            service
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Update Service
const updateService = async (req, res) => {
    try {
        const service = await EmergencyService.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service updated successfully",
            service
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Delete Service
const deleteService = async (req, res) => {
    try {
        const service = await EmergencyService.findByIdAndDelete(
            req.params.id
        );

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.status(200).json({
            message: "Service deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};

