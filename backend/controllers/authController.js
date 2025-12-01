const User = require("../models/userModel");
const Business = require("../models/businessModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const {
  generateToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/tokenUtils");
const { request } = require("express");

const backendUrl = process.env.BACKEND_DOMAIN

const registerUser = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors);

  // Start mongoose session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if username/email exist
    const { firstName, lastName, email, username, password, businessName } =
      req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ msg: "Username already exists" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ msg: "Email already exists" });
      }
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password,
    });

    await newUser.save({ session });

    // Create new business
    const newBusiness = new Business({
      name: businessName,
      owner: newUser._id,
      logo: `https://supporta.onrender.com/logo.png`
    });
    const existingBusiness = await Business.findOne({  name: { $regex: `^${businessName}$`, $options: "i" } });
    if (existingBusiness)
      return res.status(400).json({ msg: "Business name already exists" });

    await newBusiness.save({ session });

    // Get business _id and save it in the user
    newUser.businessId = newBusiness._id;
    await newUser.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    // Generate token and refresh token
    const payload = {
      id: newUser._id,
      email: newUser.email,
      businessId: newUser.businessId,
    };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // in production change to: process.env.NODE_ENV === "production"
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    await newUser.populate("businessId"); 
    const userObj = newUser.toObject();
    delete userObj.password;

    await res.status(201).json({
      user: userObj,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    await session.abortTransaction();

    res
      .status(err.status || 500)
      .json({ msg: err.message || "Internal server error" });
  } finally {
    session.endSession();
  }
};

const loginUser = async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.status(400).json({ msg: "Wrong username or password" });

  const payload = {
    id: user._id,
    email: user.email,
    businessId: user.businessId,
  };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // σε prod: process.env.NODE_ENV === "production"
    sameSite: "Strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  await user.populate({path: "businessId",  select: "-owner -__v" })

  const {
    password: _,
    createdAt,
    updatedAt,
    __v,
    ...userObj
  } = user.toObject();

  res.json({ accessToken: accessToken, refreshToken: refreshToken, userObj });
};

const refreshUserToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ msg: "Session expired" });

  try {
    const verifiedUser = verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const accessToken = generateToken({
      _id: verifiedUser.id,
      email: verifiedUser.email,
      businessId: verifiedUser.businessId,
    });

    res.json({ accessToken });
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ msg: "Unauthorized. Please login again." });
    if (err.name === "JsonWebTokenError")
      return res.status(403).json({ msg: "Invalid. Please login again." });
    res
      .status(err.status || 500)
      .json({ msg: err.message || "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    res.json({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("businessId", "name widgetToken");

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({  
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getMe,
};
