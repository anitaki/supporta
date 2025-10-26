const { verifyToken } = require("../utils/tokenUtils");
const Business = require("../models/businessModel");

const authenticateWidgetToken = async (req, res, next) => {
  const token = req.headers["x-widget-token"];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    // Check if token exists for any business
    const business = await Business.findOne({ widgetToken: token });
    if (!business) return res.status(403).json({ msg: "Invalid token" });

    req.businessId = business._id;
    next();
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

module.exports = authenticateWidgetToken;
