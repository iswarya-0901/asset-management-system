const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader); // ADD THIS

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  console.log("TOKEN:", token); // ADD THIS
  console.log("SECRET:", process.env.JWT_SECRET); // ADD THIS

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decoded); // ADD THIS
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); // ADD THIS
    return res.status(401).json({ message: err.message });
  }
};