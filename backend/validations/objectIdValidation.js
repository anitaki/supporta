const mongoose = require('mongoose');

const validateObjectId = (id) => {
    return mongoose.isObjectIdOrHexString(id);
}

module.exports = validateObjectId;