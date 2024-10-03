import jwt from "jsonwebtoken";
import User from "../models/user.model.mjs";
import dotenv from "dotenv";

dotenv.config();

const verifyAdminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token missing. Access denied." });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check for user and if admin role exists
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized access. Admin privileges required." });
    }

    // Attach the user to the request object and move forward
    req.user = user;
    next();
  } catch (error) {
    console.error("Authorization error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const verifyUserAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token missing. Access denied." });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token. User not found." });
    }

    // Attach the user to the request object and proceed
    req.user = user;
    next();
  } catch (error) {
    console.error("Authorization error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token missing. Access denied." });
    }

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check for user existence
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token. User not found." });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authorization error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export { verifyAdminAuth, verifyUserAuth, verifyAuth };
