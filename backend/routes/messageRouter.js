const express = require("express");
const router = express.Router();

const authenticateWidgetToken = require("../middleware/authenticateWidgetToken");
const { getAllMessages, getMessages, postMessage} = require("../controllers/messageController");


router.get("/", authenticateWidgetToken, getMessages);
router.get("/all", authenticateWidgetToken, getAllMessages);
router.post("/", authenticateWidgetToken, postMessage);


module.exports = router;