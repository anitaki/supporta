const handleMulterError = (err, req, res, next) => {
  console.log(err)
  if (err && err.constructor.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = handleMulterError;