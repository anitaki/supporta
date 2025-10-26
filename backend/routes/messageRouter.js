const express = require("express");
const router = express.Router();

const authenticateWidgetToken = require("../middleware/authenticateWidgetToken");
const { getMessages, postMessage} = require("../controllers/messageController");


router.get("/", authenticateWidgetToken, getMessages);
router.post("/", authenticateWidgetToken, postMessage);


module.exports = router;