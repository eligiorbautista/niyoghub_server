import express from "express";
import { verifyUserAuth } from "../middleware/verifyAuth.mjs";
import { getUserProfile, updateUserProfile, changeUserPassword } from "../controllers/user.controllers.mjs";

const router = express.Router();

// FETCH USER PROFILE
router.get("/profile", verifyUserAuth, getUserProfile);

// UPDATE USER PROFILE
router.put("/profile", verifyUserAuth, updateUserProfile);

// CHANGE PASSWORD
router.put("/change-password", verifyUserAuth, changeUserPassword);

export default router;
