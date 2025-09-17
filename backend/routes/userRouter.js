const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const authenticateToken = require("../middleware/authToken");
const {validateUpdateUser} = require("../validations/userValidation");


router.get("/", authenticateToken, getUsers);
router.get("/:id", authenticateToken, getUser);
router.patch("/:id", authenticateToken, validateUpdateUser, updateUser);
router.delete("/:id", authenticateToken, deleteUser);


module.exports = router;
