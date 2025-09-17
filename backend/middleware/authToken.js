const { verifyToken } = require("../utils/tokenUtils");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Session expired" });

  try {
    const verifiedUser = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verifiedUser;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ msg: "Unauthorized. Please login again." });
    if (err.name === "JsonWebTokenError")
      return res.status(403).json({ msg: "Invalid. Please login again." });
    res.status(err.status || 500).json({ msg: err.message || "Internal server error" });
  }
};

module.exports = authenticateToken;
