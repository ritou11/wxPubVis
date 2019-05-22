module.exports.customTh = () => new Promise((resolve) => {
  resolve();
});

module.exports.expressTh = () => (req, res, next) => {
  next();
};
