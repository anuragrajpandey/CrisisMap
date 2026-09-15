const express = require("express");

const {
    getAllResponders,
    getResponderById,
    createResponder,
    updateResponder,
    deleteResponder,
    updateResponderStatus
} = require("../controllers/responderController");

const router = express.Router();

// Get all responders
router.get("/", getAllResponders);

// Get single responder
router.get("/:id", getResponderById);

// Create responder
router.post("/", createResponder);

// Update responder
router.put("/:id", updateResponder);

// Delete responder
router.delete("/:id", deleteResponder);

// Update responder status
router.patch("/:id/status", updateResponderStatus);

module.exports = router;