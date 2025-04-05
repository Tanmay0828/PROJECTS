const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Protected Dashboard Route
router.get("/", authMiddleware, (req, res) => {
  res.json({ msg: `Hello, ${req.user.name}! Welcome to your dashboard.` });
});

module.exports = router;
