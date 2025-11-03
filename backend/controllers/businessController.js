const fs = require("fs");
const Business = require("../models/businessModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const validateObjectId = require("../validations/objectIdValidation");
const { uploadFileToB2, deleteFileFromB2 } = require("../utils/b2Storage");
const mongoose = require("mongoose");

const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({});
    if (businesses.length === 0)
      return res.status(404).json({ msg: "There are no businesses available" });
    res.status(200).json(businesses);
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getBusinessWithToken = async (req, res) => {

  try {
    const business = await Business.findOne({
      _id: req.user.businessId,
      owner: req.user.id,
    });

    if (!business) return res.status(404).json({ msg: "Business not found" });

    business.populate("owner");

    return res.status(200).json(business);
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const getBusinessWithWidgetToken = async (req, res) => {
  try {
    const business = await Business.findOne({
      _id: req.businessId,
    }).select("name logo theme color font greeting");
    if (!business) return res.status(404).json({ msg: "Business not found" });

    // business.populate("owner");

    return res.status(200).json(business);
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const updateBusiness = async (req, res) => {
  let fileUrl;
  let safeUrl;

  try {
    const allowed = [
      "name",
      "widgetToken",
      "logo",
      "color",
      "font",
      "greeting",
      "theme",
    ];

    const business = await Business.findById(req.user.businessId);
    if (!business) return res.status(404).json({ msg: "Business not found" });

    if (req.file) {
      // Delete previous logo if exists
      if (business.logo) {
        await deleteFileFromB2(business.logo);
      }

      fileUrl = await uploadFileToB2(req.file);
      safeUrl = encodeURI(fileUrl);
    }

    const updated = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) =>
          allowed.includes(key) && value && value.toString().trim() !== ""
      )
    );

    if (safeUrl) updated.logo = safeUrl;

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.user.businessId,
      { $set: updated },
      { new: true }
    ).populate("owner");

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("Error deleting temp file:", e);
      }
    }

    return res.status(200).json(updatedBusiness);
  } catch (err) {
    if (fileUrl) await deleteFileFromB2(fileUrl);

    console.error("updateBusiness error:", err);
    return res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Not to be used for now.
// For now, business is created with the new user and is deleted when user is deleted

const deleteBusiness = async (req, res) => {
  // also delete all images and files from b2
  try {
    const business = await Business.findByIdAndDelete(req.user.businessId);
    if (!business) return res.status(404).json({ msg: "Business not found" });

    return res.status(200).json({ msg: "Business was deleted successfully" });
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getBusinesses,
  getBusinessWithToken,
  getBusinessWithWidgetToken,
  updateBusiness,
  deleteBusiness,
};
