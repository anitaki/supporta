const Message = require("../models/messageModel");
const moderateUserInput = require("../utils/openaiUtils");

const getAllMessages = async (req, res) => {
  try {
    // Fetch messages for the business, sorted by conversationId and timestamp
    const messages = await Message.find({ businessId: req.businessId }).sort({
      conversationId: 1,
      timestamp: 1,
    });

    // Group messages by conversationId
    const groupedConversations = messages.reduce((acc, msg) => {
      if (!acc[msg.conversationId]) {
        acc[msg.conversationId] = [];
      }
      acc[msg.conversationId].push(msg);
      return acc;
    }, {});

    // Convert to array
    const conversationsArray = Object.entries(groupedConversations).map(
      ([conversationId, messages]) => ({
        conversationId,
        messages,
      })
    );

    res.json(conversationsArray);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


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

    const moderationWarning = await moderateUserInput(content);

    if (moderationWarning) {
      const deleted = await Message.deleteOne({ conversationId, content });
      console.log("🚀 ~ postMessage ~ deleted:", deleted);

      // Respond to user
      return res.status(400).json({
        msg: moderationWarning,
        deleted: true,
      });
    }

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

module.exports = { getAllMessages, getMessages, postMessage };
