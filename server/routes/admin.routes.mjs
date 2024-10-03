import express from "express";
import { verifyAdminAuth } from "../middleware/verifyAuth.mjs";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getUsers,
  updateUserProfile,
  getUserById 
} from "../controllers/admin.controllers.mjs";

const router = express.Router();

// FETCH ADMIN PROFILE
router.get("/profile", verifyAdminAuth, getAdminProfile);

// UPDATE ADMIN PROFILE
router.put("/profile", verifyAdminAuth, updateAdminProfile);

// CHANGE PASSWORD
router.put("/change-password", verifyAdminAuth, changeAdminPassword);

// FETCH ALL USERS (excluding admin)
router.get("/users", verifyAdminAuth, getUsers);

// FETCH USER BY ID
router.get("/users/:id", verifyAdminAuth, getUserById); 

// UPDATE USER PROFILE 
router.put("/users/:id", verifyAdminAuth, updateUserProfile); 

export default router;
