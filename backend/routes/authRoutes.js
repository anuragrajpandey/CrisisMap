const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const router = express.Router();

// Signup
router.post("/signup", register);

// Login
router.post("/login", login);

module.exports = router;