const express = require("express");
const router = express.Router();

const {validateUser} = require("../validations/userValidation");
const authenticateToken = require("../middleware/authToken")
const { registerUser, loginUser, logoutUser, refreshUserToken } = require("../controllers/authController");
const {getMe} = require("../controllers/authController")

router.get("/me",authenticateToken, getMe)
router.post("/register", validateUser, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshUserToken)

module.exports = router;
