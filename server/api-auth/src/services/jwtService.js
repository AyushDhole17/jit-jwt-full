// const jwt = require("jsonwebtoken");

// exports.generateAccessToken = (user) => {
//   // console.log(user);
//   const payload = {
//     id: user._id,
//     email: user.email,
//     role: user.role,
//   };

//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }); // 15m
// };

// exports.generateRefreshToken = (user) => {
//   // console.log(user);
//   const payload = {
//     id: user._id,
//     email: user.email,
//     role: user.role,
//   };

//   return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
// };

const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
