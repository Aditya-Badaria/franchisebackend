const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Login Route
router.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  
  const user = await User.findOne({ userId });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, userId });
});

module.exports = router;
