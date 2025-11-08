// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = "your-secret-key"; // Replace with your actual secret

export const authenticateToken = (req, res, next) => {
  console.log("Token:", req.headers.authorization); // Debugging line
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // token payload (e.g., { id, username, email })
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
