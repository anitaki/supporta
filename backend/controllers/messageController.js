const Message = require("../models/messageModel");

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      businessId: req.businessId,
      conversationId: req.query.conversationId,
    }).sort({
      timestamp: 1,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

const postMessage = async (req, res) => {
  try {
    const { conversationId, role, content } = req.body;
    const message = new Message({
      businessId: req.businessId,
      conversationId,
      role,
      content,
    });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

module.exports = { getMessages, postMessage };
