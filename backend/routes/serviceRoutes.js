const express = require("express");

const {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require("../controllers/serviceController");

const router = express.Router();

// Get all services
router.get("/", getAllServices);

// Get single service
router.get("/:id", getServiceById);

// Create service
router.post("/", createService);

// Update service
router.put("/:id", updateService);

// Delete service
router.delete("/:id", deleteService);

module.exports = router;