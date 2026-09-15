const Responder = require("../models/Responder");

// Get All Responders
const getAllResponders = async (req, res) => {
    try {
        const { status, type } = req.query;

        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (type) {
            filter.type = type;
        }

        const responders = await Responder.find(filter)
            .populate("user", "name email");

        res.status(200).json(responders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Get Single Responder
const getResponderById = async (req, res) => {
    try {
        const responder = await Responder.findById(req.params.id)
            .populate("user", "name email");

        if (!responder) {
            return res.status(404).json({
                message: "Responder not found"
            });
        }

        res.status(200).json(responder);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Create Responder
const createResponder = async (req, res) => {
    try {
        const responder = await Responder.create(req.body);

        res.status(201).json({
            message: "Responder created successfully",
            responder
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Update Responder
const updateResponder = async (req, res) => {
    try {
        const responder = await Responder.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!responder) {
            return res.status(404).json({
                message: "Responder not found"
            });
        }

        res.status(200).json({
            message: "Responder updated successfully",
            responder
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Delete Responder
const deleteResponder = async (req, res) => {
    try {
        const responder = await Responder.findByIdAndDelete(
            req.params.id
        );

        if (!responder) {
            return res.status(404).json({
                message: "Responder not found"
            });
        }

        res.status(200).json({
            message: "Responder deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Update Responder Status
const updateResponderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const responder = await Responder.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!responder) {
            return res.status(404).json({
                message: "Responder not found"
            });
        }

        res.status(200).json({
            message: "Responder status updated",
            responder
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getAllResponders,
    getResponderById,
    createResponder,
    updateResponder,
    deleteResponder,
    updateResponderStatus
};
