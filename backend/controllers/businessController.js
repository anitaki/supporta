const Business = require("../models/businessModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const validateObjectId = require("../validations/objectIdValidation");

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

const getBusiness = async (req, res) => {
  try {
    const validatedId = await validateObjectId(req.params.id);
    if (!validatedId) return res.status(400).json({ msg: "Bad request" });

    const business = await Business.findOne({ _id: req.params.id });
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

const updateBusiness = async (req, res) => {
  try {
    const validatedId = await validateObjectId(req.params.id);
    if (!validatedId) return res.status(400).json({ msg: "Bad request" });

    const business = await Business.findByIdAndUpdate(req.params.id, {
      name: req.body.name
    }, {new: true});
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


// Not to be used for now. 
// For now, business is created with the new user and is deleted when user is deleted

const deleteBusiness = async (req, res) => {
  try {
    const validatedId = await validateObjectId(req.params.id);
    if (!validatedId) return res.status(400).json({ msg: "Bad request" });

    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).json({ msg: "Business not found" });

    return res.status(200).json({msg: "Business was deleted successfully"});
  } catch (err) {
    res.status(500).json({
      msg: "Internal server error",
      err: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};


module.exports = { getBusinesses, getBusiness, updateBusiness, deleteBusiness };
