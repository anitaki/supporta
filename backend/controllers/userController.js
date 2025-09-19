const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const validateObjectId = require("../validations/objectIdValidation");
const mongoose = require("mongoose");
const Business = require("../models/businessModel");

// For development purposes only - get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0)
      return res.status(404).json({ msg: "There are no users available" });
    res
      .status(200)
      .json(
        process.env.NODE_ENV === "development"
          ? users
          : { message: "Restricted" }
      );
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({businessId: req.user.businessId});
    if (users.length === 0)
      return res.status(404).json({ msg: "There are no users available" });
    res
      .status(200)
      .json(
        process.env.NODE_ENV === "development"
          ? users
          : { message: "Restricted" }
      );
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const validatedId = validateObjectId(req.params.id);
    if (!validatedId) return res.status(400).json({ msg: "Bad request" });

    const user = await User.findOne({_id: req.params.id, businessId: req.user.businessId}).select("-password").populate("businessId");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const updateUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array() });

    if (!validateObjectId(req.params.id))
      return res.status(400).json({ msg: "Invalid user ID" });

    const user = await User.findOne({_id: req.params.id, businessId: req.user.businessId})
    if (!user) return res.status(404).json({ msg: "User not found" });
    console.log(user)

    const allowedUpdates = [
      "firstName",
      "lastName",
      "username",
      "email",
      "password",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Save triggers pre-save hook (hash password automatically)
    await user.save({ session });

    // Check if business name has changed and save
    if (req.body.businessName) {
      const business = await Business.findOne({_id: req.user.businessId, owner: req.user.id });

      business.name = req.body.businessName;
      await business.save({ session });

      user.businessId = business._id;
      await user.save({ session });
    }

    await user.populate("businessId");

    await session.commitTransaction();

    res.status(200).json(user);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedId = validateObjectId(req.params.id);
    if (!validatedId) return res.status(400).json({ msg: "Bad request" });

    const user = await User.findOne({_id: req.params.id, businessId: req.user.businessId});
    if (!user) return res.status(404).json({ msg: "User doesn't exist" });
    const business = await Business.findById(user.businessId);
    if (!business) return res.status(404).json({ msg: "Business not found" });

    await User.deleteOne({ _id: user._id }).session(session);
    await Business.deleteOne({ _id: business._id }).session(session);

    await session.commitTransaction();

    res.status(200).json({ msg: "User and business deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllUsers,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
