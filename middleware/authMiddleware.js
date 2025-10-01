const jwt = require('jsonwebtoken');


function authMiddleware(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    return res.status(401).json({ message: "Token tidak tersedia" });
  }
  // Format: 'Bearer <token>'
  const parts = bearerHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: "Format token salah" });
  }
  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: "Token tidak tersedia" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = decoded;
    next();
  });
}

module.exports = authMiddleware;
